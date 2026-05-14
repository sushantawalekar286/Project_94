const router = require("express").Router();
const { 
  listOrders, 
  placeOrder, 
  updateOrderStatus, 
  getOrderById,
  assignChef,
  assignWaiter,
  cancelOrder,
  recordPayment
} = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { orderSchema, statusSchema } = require("../validators/orderValidator");

// Public — customer places order (authenticated by QR token in body, not JWT)
router.post("/", validate(orderSchema), placeOrder);

// Protected — staff only
router.get("/", auth, role("chef", "admin", "waiter"), listOrders);
router.get("/:id", auth, role("chef", "admin", "waiter"), getOrderById);

// Status management
router.patch("/:id/status", auth, role("chef", "admin"), validate(statusSchema, "body"), updateOrderStatus);
router.post("/:id/cancel", auth, role("chef", "admin"), cancelOrder);
router.post("/:id/payment", auth, role("waiter", "admin"), recordPayment);

// Assignment
router.post("/:id/assign-chef", auth, role("admin"), assignChef);
router.post("/:id/assign-waiter", auth, role("admin"), assignWaiter);

module.exports = router;
