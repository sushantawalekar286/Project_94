const mongoose = require("mongoose");

/**
 * InventoryTransaction model — PHASE 4
 * Tracks every stock change: deductions, additions, wastage.
 * Enables full audit trail per inventory item.
 */
const inventoryTransactionSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
      index: true
    },
    transactionType: {
      type: String,
      enum: ["ADD", "DEDUCT", "WASTAGE", "ORDER_USAGE", "deduction", "addition", "wastage", "adjustment"],
      required: true
    },
    // Keep backward compatibility
    type: { type: String },
    
    quantity: { type: Number, required: true },
    oldStock: { type: Number },
    newStock: { type: Number },
    stockBefore: { type: Number }, // legacy
    stockAfter: { type: Number },  // legacy
    reason: { type: String, default: "" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // legacy
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // legacy
  },
  { timestamps: true }
);

inventoryTransactionSchema.pre("save", function(next) {
  // Sync legacy fields
  if (!this.transactionType && this.type) {
    const map = { addition: "ADD", deduction: "DEDUCT", adjustment: "DEDUCT", wastage: "WASTAGE" };
    this.transactionType = map[this.type] || "DEDUCT";
  }
  if (!this.oldStock && this.stockBefore !== undefined) this.oldStock = this.stockBefore;
  if (!this.newStock && this.stockAfter !== undefined) this.newStock = this.stockAfter;
  if (!this.orderId && this.order) this.orderId = this.order;
  if (!this.updatedBy && this.performedBy) this.updatedBy = this.performedBy;
  next();
});

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema);
