const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "General" },
    quantity: { type: Number, default: 1 },
    amount: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, required: true },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

expenseSchema.index({ purchaseDate: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
