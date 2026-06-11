const Order = require("../models/Order");
const { createOrder, onOrderPreparing, completeOrder } = require("../services/orderService");
const { getIO } = require("../config/socket");
const { isValidTransition } = require("../constants/orderStatus");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

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
  } finally {
    console.log(`[ORDER LIST FINALLY] Completed order listing`);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("table", "number token").lean();
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json(order);
  } catch (error) {
    next(error);
  } finally {
    console.log(`[ORDER GET FINALLY] Completed order fetch for ID: ${req.params.id}`);
  }
};

const placeOrder = async (req, res, next) => {
  const orderData = req.body;
  let savedOrder = null;
  try {
    console.log(orderData);

    // Determine source
    let source = orderData.source;
    if (!source) {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET);
          if (decoded && ["admin", "chef", "waiter"].includes(decoded.role)) {
            source = "Staff Order";
          }
        } catch (err) {
          // Ignore token verification errors
        }
      }
    }
    if (!source) {
      source = "QR Order";
    }
    orderData.source = source;

    const order = await createOrder(orderData);
    savedOrder = order;
    console.log(savedOrder);

    const io = getIO();
    if (io) {
      io.to("chef").emit("order:new", order);
      io.to("admin").emit("order:new", order);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error(error);
    // Propagate stock errors as 400
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  } finally {
    console.log(`[ORDER PLACE FINALLY] Completed order placement attempt for Table: ${orderData?.tableNumber || "unknown"}`);
  }
};

const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    console.log(`[ORDER REQUEST] Request to update status of Order ${req.params.id} to "${status}"`);

    // Fetch current order
    const current = await Order.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "Order not found" });

    // PHASE 5 — Validate transition
    if (!isValidTransition(current.status, status)) {
      console.warn(`[ORDER ERROR] Invalid transition for Order ${req.params.id}: "${current.status}" -> "${status}"`);
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: "${current.status}" → "${status}"`
      });
    }

    const updateFields = { status };
    if (status === "Accepted") {
      updateFields.acceptedAt = new Date();
    } else if (status === "Cooking") {
      updateFields.cookingStartedAt = new Date();
    } else if (status === "Ready") {
      updateFields.readyAt = new Date();
    } else if (status === "Served") {
      updateFields.servedAt = new Date();
    } else if (status === "Completed") {
      updateFields.completedAt = new Date();
    } else if (status === "Paid") {
      updateFields.paidAt = new Date();
      updateFields.completedAt = new Date(); // Treat Paid as Completed for tracking expiry
      updateFields.paymentStatus = "paid";
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).lean();

    // Trigger inventory deduction when kitchen starts Cooking or Accepted
    if ((status === "Cooking" || status === "Accepted") && current.status === "Pending") {
      await onOrderPreparing(order);
    }

    // Record Sale and free table when order is Completed or Paid
    if ((status === "Completed" || status === "Paid") && current.status !== "Completed" && current.status !== "Paid") {
      await completeOrder(order);
      const Table = require("../models/Table");
      await Table.findByIdAndUpdate(order.table, { activeOrder: null, status: "available" });
    }

    console.log(`[MONGO SAVE] Order ${order._id} status updated successfully from "${current.status}" to "${status}"`);

    const io = getIO();
    if (io) {
      io.to("chef").emit("order:updated", order);
      io.to("admin").emit("order:updated", order);
      io.to(`order:${order._id}`).emit("order:updated", order);
    }

    res.json(order);
  } catch (error) {
    console.error(`[ORDER ERROR] Failed to update status of Order ${req.params.id} to "${status}": ${error.message}`);
    next(error);
  } finally {
    console.log(`[ORDER UPDATE FINALLY] Completed order update attempt for ID: ${req.params.id}`);
  }
};

const getActiveOrderByTable = async (req, res, next) => {
  try {
    const { tableNumber } = req.params;
    const order = await Order.findOne({ tableNumber: Number(tableNumber) })
      .sort({ createdAt: -1 })
      .populate("table", "number token")
      .lean();

    if (!order) {
      return res.json({ active: false, order: null });
    }

    let isActive = false;
    if (order.status !== "Cancelled") {
      if (order.status !== "Completed" && order.status !== "Paid") {
        isActive = true;
      } else {
        const referenceTime = order.completedAt || order.paidAt || order.updatedAt;
        const elapsed = Date.now() - new Date(referenceTime).getTime();
        if (elapsed < 5 * 60 * 1000) {
          isActive = true;
        }
      }
    }

    res.json({ active: isActive, order: isActive ? order : null });
  } catch (error) {
    next(error);
  }
};

const getCompletedOrdersCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments({ status: { $in: ["Completed", "Paid"] } });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = { listOrders, placeOrder, updateOrderStatus, getOrderById, getActiveOrderByTable, getCompletedOrdersCount };
