const router = require("express").Router();
const {
  getDailySales,
  getMonthlySales,
  getDashboardStats,
  getTopItems,
  getRevenueTimeline
} = require("../controllers/salesController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth, role("admin"));

router.get("/daily", getDailySales);
router.get("/monthly", getMonthlySales);
router.get("/dashboard", getDashboardStats);
router.get("/top-items", getTopItems);
router.get("/timeline", getRevenueTimeline);

module.exports = router;
