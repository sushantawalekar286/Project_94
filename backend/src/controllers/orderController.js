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

const updateOrderItemStatus = async (req, res, next) => {
  const { id, itemIndex } = req.params;
  const { kitchenStatus, served } = req.body;
  const userRole = req.user.role;

  try {
    const idx = parseInt(itemIndex, 10);
    if (isNaN(idx)) {
      return res.status(400).json({ success: false, message: "Invalid item index" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["Served", "Completed", "Paid"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Cannot modify completed order." });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cannot modify cancelled order." });
    }

    if (idx < 0 || idx >= order.items.length) {
      return res.status(400).json({ success: false, message: "Item index out of bounds" });
    }

    const item = order.items[idx];

    // Enforce role permissions
    if (kitchenStatus !== undefined) {
      if (userRole !== "chef" && userRole !== "admin") {
        return res.status(403).json({ success: false, message: "Only Chef and Admin can mark items prepared" });
      }
      item.kitchenStatus = kitchenStatus;
      if (kitchenStatus === "ready") {
        item.preparedAt = new Date();
      } else {
        item.preparedAt = null;
      }
    }

    if (served !== undefined) {
      if (userRole !== "waiter" && userRole !== "admin") {
        return res.status(403).json({ success: false, message: "Only Waiter and Admin can mark items served" });
      }
      item.served = served;
      if (served) {
        item.servedAt = new Date();
      } else {
        item.servedAt = null;
      }
    }

    // Auto-calculate order status
    const previousStatus = order.status;
    if (!["Paid", "Completed", "Cancelled"].includes(order.status)) {
      const items = order.items || [];
      const totalItems = items.length;
      let preparedCount = 0;
      let servedCount = 0;

      for (const it of items) {
        if (it.kitchenStatus === "ready") {
          preparedCount++;
        }
        if (it.served) {
          servedCount++;
        }
      }

      let newStatus = "Pending";
      if (servedCount === totalItems) {
        newStatus = "Served";
      } else if (preparedCount === totalItems) {
        newStatus = "Ready";
      } else if (preparedCount > 0) {
        newStatus = "Preparing";
      }

      order.status = newStatus;

      // Set timestamps
      if (newStatus === "Preparing" && !order.cookingStartedAt) {
        order.cookingStartedAt = new Date();
      }
      if (newStatus === "Ready" && !order.readyAt) {
        order.readyAt = new Date();
      }
      if (newStatus === "Served" && !order.servedAt) {
        order.servedAt = new Date();
      }
    }

    // Save order
    const updatedOrder = await order.save();

    // Trigger preparing hook if status transitioned to Preparing
    if (updatedOrder.status === "Preparing" && previousStatus === "Pending") {
      await onOrderPreparing(updatedOrder);
    }

    // Emit Socket updates
    const io = getIO();
    if (io) {
      io.to("chef").emit("order:updated", updatedOrder);
      io.to("admin").emit("order:updated", updatedOrder);
      io.to(`order:${updatedOrder._id}`).emit("order:updated", updatedOrder);
      io.emit("order:updated", updatedOrder); // General emit for waiter page
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userRole = req.user.role;
  const username = req.user.name || req.user.username || userRole;

  try {
    if (userRole !== "admin" && userRole !== "waiter") {
      return res.status(403).json({ success: false, message: "Only Waiter and Admin can cancel orders" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["Served", "Completed", "Paid"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel a served/completed order." });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled." });
    }

    // Check if any item in the order has already been served
    const hasServedItems = order.items && order.items.some(item => item.served);
    if (hasServedItems) {
      return res.status(400).json({ success: false, message: "Cannot cancel order because some items have already been served. Please cancel individual unserved items instead." });
    }

    // Cancel all items (since none are served)
    for (const item of order.items) {
      item.cancelled = true;
      item.cancelReason = reason || "Full order cancelled";
      item.cancelledBy = username;
      item.cancelledAt = new Date();
      item.inventoryConsumed = item.kitchenStatus === "ready";
    }

    order.status = "Cancelled";
    order.paymentStatus = "cancelled";
    order.cancelReason = reason || "Full order cancelled";
    order.cancelledBy = username;
    order.cancelledAt = new Date();

    // Release table if occupied by this order
    const Table = require("../models/Table");
    const table = await Table.findById(order.table);
    if (table && table.activeOrder?.toString() === order._id.toString()) {
      table.activeOrder = null;
      table.status = "available";
      await table.save();
    }

    const updatedOrder = await order.save();

    // Emit Socket updates
    const io = getIO();
    if (io) {
      io.to("chef").emit("order:updated", updatedOrder);
      io.to("admin").emit("order:updated", updatedOrder);
      io.to(`order:${updatedOrder._id}`).emit("order:updated", updatedOrder);
      io.emit("order:updated", updatedOrder);
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

const cancelOrderItem = async (req, res, next) => {
  const { id, itemId } = req.params;
  const { reason } = req.body;
  const userRole = req.user.role;
  const username = req.user.name || req.user.username || userRole;

  try {
    if (userRole !== "admin" && userRole !== "waiter") {
      return res.status(403).json({ success: false, message: "Only Waiter and Admin can cancel items" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["Served", "Completed", "Paid"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Cannot modify completed order." });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cannot modify cancelled order." });
    }

    // Resolve index
    let idx = parseInt(itemId, 10);
    if (isNaN(idx)) {
      idx = order.items.findIndex(it => it.name.toLowerCase() === itemId.toLowerCase());
    }

    if (idx < 0 || idx >= order.items.length) {
      return res.status(400).json({ success: false, message: "Item not found in order" });
    }

    const item = order.items[idx];
    if (item.served) {
      return res.status(400).json({ success: false, message: "Served items cannot be cancelled." });
    }

    if (item.cancelled) {
      return res.status(400).json({ success: false, message: "Item is already cancelled." });
    }

    item.cancelled = true;
    item.cancelReason = reason || "Item cancelled";
    item.cancelledBy = username;
    item.cancelledAt = new Date();
    item.inventoryConsumed = item.kitchenStatus === "ready";

    // Recalculate subtotal/total of the order excluding cancelled items
    order.subtotal = order.items.reduce((sum, it) => {
      return sum + (it.cancelled ? 0 : it.price * it.quantity);
    }, 0);
    order.total = order.subtotal + order.tax;

    // Recalculate overall status based on non-cancelled items
    const nonCancelledItems = order.items.filter(it => !it.cancelled);
    const totalActive = nonCancelledItems.length;

    if (totalActive === 0) {
      // If all items are cancelled, cancel the entire order
      order.status = "Cancelled";
      order.paymentStatus = "cancelled";
      order.cancelReason = reason || "All items cancelled";
      order.cancelledBy = username;
      order.cancelledAt = new Date();

      // Release table
      const Table = require("../models/Table");
      const table = await Table.findById(order.table);
      if (table && table.activeOrder?.toString() === order._id.toString()) {
        table.activeOrder = null;
        table.status = "available";
        await table.save();
      }
    } else {
      let preparedCount = 0;
      let servedCount = 0;

      for (const it of nonCancelledItems) {
        if (it.kitchenStatus === "ready") {
          preparedCount++;
        }
        if (it.served) {
          servedCount++;
        }
      }

      let newStatus = "Pending";
      if (servedCount === totalActive) {
        newStatus = "Served";
      } else if (preparedCount === totalActive) {
        newStatus = "Ready";
      } else if (preparedCount > 0) {
        newStatus = "Preparing";
      }
      order.status = newStatus;
    }

    const updatedOrder = await order.save();

    // Emit Socket updates
    const io = getIO();
    if (io) {
      io.to("chef").emit("order:updated", updatedOrder);
      io.to("admin").emit("order:updated", updatedOrder);
      io.to(`order:${updatedOrder._id}`).emit("order:updated", updatedOrder);
      io.emit("order:updated", updatedOrder);
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  listOrders, 
  placeOrder, 
  updateOrderStatus, 
  getOrderById, 
  getActiveOrderByTable, 
  getCompletedOrdersCount,
  updateOrderItemStatus,
  cancelOrder,
  cancelOrderItem
};
