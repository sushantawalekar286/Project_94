const mongoose = require("mongoose");
const orderItemSchema = require("./OrderItem");
require("./Table"); // Ensure Table schema is registered before population

const orderSchema = new mongoose.Schema(
  {
    table: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Table", 
      required: true 
    },
    tableNumber: { 
      type: Number, 
      required: true 
    },
    items: [orderItemSchema],
    subtotal: { 
      type: Number, 
      required: true,
      min: 0
    },
    tax: { 
      type: Number, 
      required: true,
      min: 0
    },
    total: { 
      type: Number, 
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Cooking",
        "Ready",
        "Served",
        "Paid",
        "Completed",
        "Cancelled"
      ],
      default: "Pending"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile", "other"],
      default: null
    },
    specialInstructions: {
      type: String,
      default: ""
    },
    inventoryProcessed: { 
      type: Boolean, 
      default: false 
    },
    acceptedAt: { 
      type: Date,
      default: null
    },
    cookingStartedAt: { 
      type: Date,
      default: null
    },
    readyAt: { 
      type: Date,
      default: null
    },
    servedAt: { 
      type: Date,
      default: null
    },
    paidAt: { 
      type: Date,
      default: null
    },
    completedAt: { 
      type: Date,
      default: null
    },
    assignedChef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    assignedWaiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    review: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

orderSchema.index({ table: 1, status: 1 });
orderSchema.index({ tableNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ assignedChef: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
