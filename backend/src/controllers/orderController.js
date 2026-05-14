const Order = require("../models/Order");
const { createOrder, onOrderAccepted, onOrderCooking, completeOrder } = require("../services/orderService");
const { getIO } = require("../config/socket");
const { isValidTransition, ORDER_STATUS } = require("../constants/orderStatus");

/**
 * Order Controller - Complete lifecycle management
 * Handles order creation, status transitions, payment, and delivery.
 */

const listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("table", "number token")
      .populate("assignedChef", "name email")
      .populate("assignedWaiter", "name email")
      .lean();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("table", "number token")
      .populate("assignedChef", "name email")
      .populate("assignedWaiter", "name email");
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
      io.to(`table:${order.table}`).emit("order:placed", order);
    }
    res.status(201).json(order);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const current = await Order.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "Order not found" });

    if (!isValidTransition(current.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: "${current.status}" → "${status}"`
      });
    }

    const updates = { status };
    
    if (status === ORDER_STATUS.ACCEPTED) {
      updates.acceptedAt = new Date();
      await onOrderAccepted(current);
    } else if (status === ORDER_STATUS.COOKING) {
      updates.cookingStartedAt = new Date();
      await onOrderCooking(current);
    } else if (status === ORDER_STATUS.READY) {
      updates.readyAt = new Date();
    } else if (status === ORDER_STATUS.SERVED) {
      updates.servedAt = new Date();
    } else if (status === ORDER_STATUS.PAID) {
      updates.paidAt = new Date();
      updates.paymentStatus = "paid";
    } else if (status === ORDER_STATUS.COMPLETED) {
      await completeOrder(current);
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("assignedChef", "name email")
      .populate("assignedWaiter", "name email");

    const io = getIO();
    if (io) {
      io.to("chef").emit("order:updated", order);
      io.to("admin").emit("order:updated", order);
      io.to("waiter").emit("order:updated", order);
      io.to(`order:${order._id}`).emit("order:updated", order);
      io.to(`table:${order.table}`).emit("order:status", { orderId: order._id, status: order.status });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const assignChef = async (req, res, next) => {
  try {
    const { chefId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedChef: chefId },
      { new: true }
    ).populate("assignedChef", "name email");

    const io = getIO();
    if (io) io.to("chef").emit("order:assigned", order);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const assignWaiter = async (req, res, next) => {
  try {
    const { waiterId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedWaiter: waiterId },
      { new: true }
    ).populate("assignedWaiter", "name email");

    const io = getIO();
    if (io) io.to("waiter").emit("order:assigned", order);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: ORDER_STATUS.CANCELLED },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const io = getIO();
    if (io) {
      io.to("chef").emit("order:cancelled", order);
      io.to("admin").emit("order:cancelled", order);
      io.to(`table:${order.table}`).emit("order:cancelled", order);
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "paid", paymentMethod, paidAt: new Date() },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const io = getIO();
    if (io) {
      io.to(`table:${order.table}`).emit("order:paid", order);
      io.emit("order:updated", order);
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  listOrders, 
  getOrderById, 
  placeOrder, 
  updateOrderStatus,
  assignChef,
  assignWaiter,
  cancelOrder,
  recordPayment
};
