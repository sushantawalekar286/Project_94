const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    unit: { type: String, default: "pcs" },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    totalAdded: { type: Number, default: 0 },
    totalUsed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Virtual for remainingStock to alias stock for frontend compatibility
inventorySchema.virtual('remainingStock').get(function() {
  return this.stock;
});

// Ensure virtuals are included in JSON responses
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Inventory", inventorySchema);
