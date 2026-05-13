const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    isAvailable: { type: Boolean, default: true },
    ingredients: [
      {
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
        quantity: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
