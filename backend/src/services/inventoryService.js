const Inventory = require("../models/Inventory");
const Recipe = require("../models/Recipe");
const InventoryTransaction = require("../models/InventoryTransaction");

/**
 * PHASE 4 — Complete Auto Inventory Management
 * 
 * Validates that sufficient stock exists BEFORE deducting.
 * Prevents negative stock via atomic $inc with floor check.
 * Creates InventoryTransaction records for full audit trail.
 */

/**
 * Check if stock is sufficient for a given order.
 * Returns { ok: true } or { ok: false, shortages: [...] }
 */
const validateStockForOrder = async (orderItems) => {
  const shortages = [];
  const MenuItem = require("../models/MenuItem");

  for (const item of orderItems) {
    const menuItem = await MenuItem.findById(item.menuItem).populate("ingredients.inventoryItem");
    if (!menuItem || !menuItem.ingredients) continue;

    for (const ingredient of menuItem.ingredients) {
      const required = ingredient.quantity * item.quantity;
      const inv = await Inventory.findById(ingredient.inventoryItem._id);
      if (!inv) continue;
      if (inv.stock < required) {
        shortages.push({
          ingredient: inv.name,
          required,
          available: inv.stock,
          unit: inv.unit
        });
      }
    }
  }

  return shortages.length === 0
    ? { ok: true }
    : { ok: false, shortages };
};

/**
 * Deduct inventory for a completed/preparing order.
 * Uses findOneAndUpdate with $inc to prevent race conditions.
 * Logs every change to InventoryTransaction.
 */
const deductInventoryForOrder = async (orderItems, orderId = null, performedBy = null) => {
  const MenuItem = require("../models/MenuItem");

  for (const item of orderItems) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem || !menuItem.ingredients) continue;

    for (const ingredient of menuItem.ingredients) {
      const deductQty = ingredient.quantity * item.quantity;

      // Atomically fetch and deduct, ensuring stock doesn't go below 0
      let result = await Inventory.findOneAndUpdate(
        { _id: ingredient.inventoryItem, stock: { $gte: deductQty } },
        { $inc: { stock: -deductQty, totalUsed: deductQty } }
      );

      let stockBefore, actualDeduction, stockAfter;

      if (result) {
        // Stock was sufficient and deducted
        stockBefore = result.stock;
        actualDeduction = deductQty;
        stockAfter = stockBefore - actualDeduction;
      } else {
        // Stock was less than deductQty, deduct whatever is left down to 0
        const invCheck = await Inventory.findById(ingredient.inventoryItem);
        if (!invCheck || invCheck.stock <= 0) continue;
        
        result = await Inventory.findByIdAndUpdate(
          ingredient.inventoryItem,
          { $set: { stock: 0 }, $inc: { totalUsed: invCheck.stock } }
        );
        if (!result) continue;
        
        stockBefore = result.stock;
        actualDeduction = stockBefore; // Only deduct what was available
        stockAfter = 0;
      }

      // Create audit transaction if something was actually deducted
      if (actualDeduction > 0) {
        await InventoryTransaction.create({
          inventoryItem: ingredient.inventoryItem,
          transactionType: orderId ? "ORDER_USAGE" : "DEDUCT",
          quantity: -actualDeduction,
          oldStock: stockBefore,
          newStock: stockAfter,
          reason: orderId ? `Order completed: ${orderId}` : "Manual deduction",
          orderId: orderId,
          updatedBy: performedBy
        });
      }
    }
  }
};

/**
 * Manually add stock to an inventory item (admin restock).
 * Creates an "addition" transaction record.
 */
const addStock = async (inventoryItemId, qty, reason = "Manual restock", performedBy = null) => {
  const inv = await Inventory.findById(inventoryItemId);
  if (!inv) throw new Error("Inventory item not found");

  const stockBefore = inv.stock;
  const stockAfter = stockBefore + Number(qty);

  await Inventory.findByIdAndUpdate(inventoryItemId, { 
    $set: { stock: stockAfter },
    $inc: { totalAdded: Number(qty) }
  });

  await InventoryTransaction.create({
    inventoryItem: inventoryItemId,
    transactionType: "ADD",
    quantity: Number(qty),
    oldStock: stockBefore,
    newStock: stockAfter,
    reason,
    updatedBy: performedBy
  });

  return { stockBefore, stockAfter };
};

/**
 * Returns all items below their lowStockThreshold.
 */
const getLowStockItems = async () => {
  // Use aggregation to compare stock vs threshold in DB
  return Inventory.aggregate([
    { $match: { $expr: { $lte: ["$stock", "$lowStockThreshold"] } } },
    { $sort: { stock: 1 } }
  ]);
};

module.exports = {
  deductInventoryForOrder,
  validateStockForOrder,
  addStock,
  getLowStockItems
};
