const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
    quantity: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
