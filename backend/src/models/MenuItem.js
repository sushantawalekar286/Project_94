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
    preparationTime: { 
      type: Number, 
      default: 15, 
      min: 1 
    },
    spiceLevel: { 
      type: Number, 
      enum: [0, 1, 2, 3, 4, 5], 
      default: 1 
    },
    vegetarian: { 
      type: Boolean, 
      default: false 
    },
    vegan: { 
      type: Boolean, 
      default: false 
    },
    allergens: [
      { type: String }
    ]
  },
  { timestamps: true }
);

menuItemSchema.index({ isAvailable: 1, category: 1 });
menuItemSchema.index({ vegetarian: 1, vegan: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);
