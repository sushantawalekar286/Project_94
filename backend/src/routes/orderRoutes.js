const router = require("express").Router();
const { 
  listOrders, 
  placeOrder, 
  updateOrderStatus, 
  getOrderById, 
  getActiveOrderByTable, 
  getCompletedOrdersCount,
  updateOrderItemStatus,
  cancelOrder,
  cancelOrderItem
} = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { orderSchema, statusSchema } = require("../validators/orderValidator");

// Public — customer queries active order or places one
router.get("/active/table/:tableNumber", getActiveOrderByTable);
router.get("/completed-count", getCompletedOrdersCount);
router.post("/", validate(orderSchema), placeOrder);

// Protected — staff only
router.get("/", auth, role("chef", "admin"), listOrders);
router.get("/:id", auth, role("chef", "admin"), getOrderById);
router.patch("/:id/status", auth, role("chef", "admin"), validate(statusSchema, "body"), updateOrderStatus);
router.patch("/:id/items/:itemIndex/status", auth, role("chef", "waiter", "admin"), updateOrderItemStatus);

// Cancellation endpoints (Admin and Waiter only)
router.post("/:id/cancel", auth, role("waiter", "admin"), cancelOrder);
router.post("/:id/items/:itemId/cancel", auth, role("waiter", "admin"), cancelOrderItem);

module.exports = router;
