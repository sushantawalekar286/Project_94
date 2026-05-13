const mongoose = require("mongoose");
const orderItemSchema = require("./OrderItem");

const orderSchema = new mongoose.Schema(
  {
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
    tableNumber: { type: Number, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    inventoryProcessed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Served", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
