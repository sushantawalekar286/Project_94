const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");
const { deductInventoryForOrder, validateStockForOrder } = require("./inventoryService");
const Sale = require("../models/Sale");

const TAX_RATE = 0.08;

/**
 * PHASE 2 & 4 — Fixed orderService
 * 
 * Bugs fixed:
 * 1. Stock validation now runs BEFORE creating the order — prevents ghost orders.
 * 2. Inventory deduction moved to "Preparing" status instead of "Completed"
 *    so the kitchen can't start cooking if stock is insufficient.
 * 3. completeOrder() guards against double-processing (inventoryProcessed flag).
 * 4. createOrder() properly handles all table lookup combinations.
 */

const findTable = async ({ tableNumber, token }) => {
  if (token && tableNumber) {
    const table = await Table.findOne({ number: tableNumber, token });
    if (table) return table;
    // Fallback: match by number only (QR token may have refreshed)
    return Table.findOne({ number: tableNumber });
  }
  if (tableNumber) return Table.findOne({ number: tableNumber });
  if (token) return Table.findOne({ token });
  return null;
};

const createOrder = async ({ tableId, tableNumber, token, items }) => {
  if (!tableId && !tableNumber && !token) {
    throw new Error("Table information is required");
  }

  const table = tableId
    ? await Table.findById(tableId)
    : await findTable({ tableNumber, token });

  if (!table) throw new Error("Table not found");

  // Validate & enrich items
  const enrichedItems = [];
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem) throw new Error(`Menu item not found: ${item.menuItem}`);
    if (!menuItem.isAvailable) throw new Error(`"${menuItem.name}" is currently unavailable`);
    enrichedItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity
    });
  }

  // PHASE 4 — Validate stock BEFORE creating order
  const stockCheck = await validateStockForOrder(enrichedItems);
  if (!stockCheck.ok) {
    const details = stockCheck.shortages
      .map((s) => `${s.ingredient}: need ${s.required} ${s.unit}, have ${s.available}`)
      .join("; ");
    throw Object.assign(new Error(`Insufficient stock: ${details}`), { statusCode: 400 });
  }

  const subtotal = enrichedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const order = await Order.create({
    table: table._id,
    tableNumber: table.number,
    items: enrichedItems,
    subtotal,
    tax,
    total
  });

  return order;
};

/**
 * Called when order reaches "Preparing" — deduct ingredients immediately.
 * Called when order reaches "Completed" — record Sale.
 */
const onOrderPreparing = async (order) => {
  if (order.inventoryProcessed) return order;
  
  // Use atomic update to prevent duplicate processing if called concurrently
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, inventoryProcessed: { $ne: true } },
    { inventoryProcessed: true },
    { new: true }
  );
  
  if (!updated) return order; // Already processed by another request

  await deductInventoryForOrder(updated.items, updated._id);
  return updated;
};

const completeOrder = async (order) => {
  // Record sale — idempotent guard via Sale lookup
  const existing = await Sale.findOne({ order: order._id });
  if (!existing) {
    await Sale.create({ order: order._id, amount: order.total });
  }
  return order;
};

module.exports = { createOrder, onOrderPreparing, completeOrder };
