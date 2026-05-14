const mongoose = require("mongoose");

/**
 * Ingredient Model - Used in the inventory and menu system
 * 
 * Tracks individual ingredients with stock management,
 * supplier info, and cost tracking for financial reports.
 */
const ingredientSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    currentStock: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0 
    },
    unit: { 
      type: String, 
      enum: ["kg", "g", "liter", "ml", "pcs", "dozen", "box"],
      default: "pcs" 
    },
    minimumStockAlert: { 
      type: Number, 
      required: true, 
      default: 10 
    },
    supplier: { 
      type: String, 
      trim: true,
      default: "" 
    },
    costPerUnit: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0 
    },
    isAvailable: { 
      type: Boolean, 
      default: true 
    },
    lastRestocked: { 
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Index for finding low stock items
ingredientSchema.index({ currentStock: 1, minimumStockAlert: 1 });
ingredientSchema.index({ isAvailable: 1 });

module.exports = mongoose.model("Ingredient", ingredientSchema);
