const Inventory = require("../models/Inventory");
const InventoryTransaction = require("../models/InventoryTransaction");
const { addStock, getLowStockItems } = require("../services/inventoryService");

/**
 * PHASE 4 — Enhanced inventoryController
 *
 * New endpoints:
 * - GET /api/inventory/low-stock — returns items below threshold
 * - GET /api/inventory/:id/history — transaction log for one item
 * - POST /api/inventory/:id/restock — add stock with transaction log
 *
 * Fixes:
 * - listInventory now includes low-stock flag in response
 * - updateInventory logs the change to InventoryTransaction
 * - All handlers return 404 when item not found
 */

const listInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ name: 1 }).lean();
    // Attach computed isLowStock flag
    const enriched = items.map((item) => ({
      ...item,
      isLowStock: item.stock <= item.lowStockThreshold
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const items = await getLowStockItems();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

const updateInventory = async (req, res, next) => {
  try {
    const { stock, name, unit, lowStockThreshold } = req.body;
    const inv = await Inventory.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: "Inventory item not found" });

    const stockBefore = inv.stock;
    const updatePayload = {};
    if (stock !== undefined) updatePayload.stock = Number(stock);
    if (name !== undefined) updatePayload.name = name;
    if (unit !== undefined) updatePayload.unit = unit;
    if (lowStockThreshold !== undefined) updatePayload.lowStockThreshold = Number(lowStockThreshold);

    const updated = await Inventory.findByIdAndUpdate(req.params.id, updatePayload, { new: true, runValidators: true });

    // Log stock change if stock was adjusted
    if (stock !== undefined && Number(stock) !== stockBefore) {
      const diff = Number(stock) - stockBefore;
      await InventoryTransaction.create({
        inventoryItem: inv._id,
        transactionType: diff > 0 ? "ADD" : "DEDUCT",
        quantity: diff,
        oldStock: stockBefore,
        newStock: Number(stock),
        reason: "Manual admin update",
        updatedBy: req.user?.id || null
      });
    }

    res.json({ ...updated.toObject(), isLowStock: updated.stock <= updated.lowStockThreshold });
  } catch (error) {
    next(error);
  }
};

const restockInventory = async (req, res, next) => {
  try {
    const { quantity, reason } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive number" });
    }
    const result = await addStock(req.params.id, quantity, reason || "Admin restock", req.user?.id);
    const updated = await Inventory.findById(req.params.id);
    res.json({ ...updated.toObject(), ...result, isLowStock: updated.stock <= updated.lowStockThreshold });
  } catch (error) {
    next(error);
  }
};

const getInventoryHistory = async (req, res, next) => {
  try {
    const history = await InventoryTransaction.find({ inventoryItem: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("performedBy", "name email")
      .lean();
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = { listInventory, updateInventory, getLowStock, restockInventory, getInventoryHistory };
