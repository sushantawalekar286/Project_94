const mongoose = require("mongoose");
const orderItemSchema = require("./OrderItem");

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
    // Complete status flow
    status: {
      type: String,
      enum: [
        "Pending",      // Customer placed order, waiting for kitchen acceptance
        "Accepted",     // Kitchen accepted the order
        "Cooking",      // Chef is actively cooking
        "Ready",        // Order ready for pickup/serving
        "Served",       // Waiter served the order
        "Paid",         // Payment received
        "Completed",    // Order fully completed
        "Cancelled"     // Order cancelled
      ],
      default: "Pending"
    },
    // Payment tracking
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
    // Kitchen notes
    specialInstructions: {
      type: String,
      default: ""
    },
    // Inventory processing
    inventoryProcessed: { 
      type: Boolean, 
      default: false 
    },
    // Timestamps for SLA tracking
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
    // Assigned chef
    assignedChef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    // Assigned waiter
    assignedWaiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    // Customer feedback
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

// Indexes for common queries
orderSchema.index({ table: 1, status: 1 });
orderSchema.index({ tableNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ assignedChef: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
