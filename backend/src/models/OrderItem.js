const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    portionType: { type: String, enum: ["single", "half", "full"], default: "single" },
    kitchenStatus: { type: String, enum: ["pending", "ready"], default: "pending" },
    served: { type: Boolean, default: false },
    preparedAt: { type: Date, default: null },
    servedAt: { type: Date, default: null },
    cancelled: { type: Boolean, default: false },
    cancelReason: { type: String, default: "" },
    cancelledBy: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },
    inventoryConsumed: { type: Boolean, default: false }
  },
  { _id: false }
);

module.exports = orderItemSchema;
