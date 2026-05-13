const Order = require("../models/Order");
const { createOrder, onOrderPreparing, completeOrder } = require("../services/orderService");
const { getIO } = require("../config/socket");
const { isValidTransition } = require("../constants/orderStatus");

/**
 * PHASE 2 & 5 — Fixed orderController
 *
 * Bugs fixed:
 * 1. updateOrderStatus now validates transitions (Phase 5).
 * 2. Proper 404 handling with explicit check.
 * 3. Inventory deduction now triggered at "Preparing" (not Completed).
 * 4. Sale recording triggered at "Completed".
 * 5. Socket emissions use consistent event names.
 * 6. Proper error propagation via next().
 */

const listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("table", "number token")
      .lean(); // Performance: use lean() since we only read
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("table", "number token");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const placeOrder = async (req, res, next) => {
  try {
    const order = await createOrder(req.body);
    const io = getIO();
    if (io) {
      io.to("chef").emit("order:new", order);
      io.to("admin").emit("order:new", order);
    }
    res.status(201).json(order);
  } catch (error) {
    // Propagate stock errors as 400
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Fetch current order
    const current = await Order.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "Order not found" });

    // PHASE 5 — Validate transition
    if (!isValidTransition(current.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: "${current.status}" → "${status}"`
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Trigger inventory deduction when kitchen starts Preparing
    if (status === "Preparing" && current.status === "Pending") {
      await onOrderPreparing(order);
    }

    // Record Sale when order is Completed
    if (status === "Completed" && current.status !== "Completed") {
      await completeOrder(order);
    }

    const io = getIO();
    if (io) {
      io.to("chef").emit("order:updated", order);
      io.to("admin").emit("order:updated", order);
      io.to(`order:${order._id}`).emit("order:updated", order);
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { listOrders, placeOrder, updateOrderStatus, getOrderById };
