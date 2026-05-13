const router = require("express").Router();
const { listOrders, placeOrder, updateOrderStatus, getOrderById } = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { orderSchema, statusSchema } = require("../validators/orderValidator");

// Public — customer places order (authenticated by QR token in body, not JWT)
router.post("/", validate(orderSchema), placeOrder);

// Protected — staff only
router.get("/", auth, role("chef", "admin"), listOrders);
router.get("/:id", auth, role("chef", "admin"), getOrderById);
router.patch("/:id/status", auth, role("chef", "admin"), validate(statusSchema, "body"), updateOrderStatus);

module.exports = router;
