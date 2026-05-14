const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      default: "" 
    },
    imageUrl: { 
      type: String, 
      default: "" 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    isAvailable: { 
      type: Boolean, 
      default: true 
    },
    // New fields for comprehensive menu management
    preparationTime: { 
      type: Number, 
      default: 15, 
      min: 1 // in minutes
    },
    spiceLevel: { 
      type: Number, 
      enum: [0, 1, 2, 3, 4, 5], 
      default: 1 // 0=no spice, 5=very hot
    },
    vegetarian: { 
      type: Boolean, 
      default: false 
    },
    vegan: { 
      type: Boolean, 
      default: false 
    },
    stockQuantity: { 
      type: Number, 
      default: 100, 
      min: 0 
    },
    lowStockThreshold: { 
      type: Number, 
      default: 10, 
      min: 0 
    },
    // Ingredients with quantities
    ingredients: [
      {
        ingredient: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Ingredient",
          required: true 
        },
        quantity: { 
          type: Number, 
          default: 1, 
          min: 0 
        },
        unit: {
          type: String,
          enum: ["kg", "g", "liter", "ml", "pcs", "dozen", "box"],
          default: "pcs"
        }
      }
    ],
    // Track when item ran out of stock
    outOfStockSince: { 
      type: Date, 
      default: null 
    },
    // Allergies/warnings
    allergens: [
      { 
        type: String, 
        enum: ["nuts", "dairy", "gluten", "shellfish", "eggs", "soy", "sesame"]
      }
    ]
  },
  { timestamps: true }
);

// Indexes for common queries
menuItemSchema.index({ isAvailable: 1, category: 1 });
menuItemSchema.index({ vegetarian: 1, vegan: 1 });
menuItemSchema.index({ stockQuantity: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);
