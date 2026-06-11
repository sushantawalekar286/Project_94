const router = require("express").Router();
const {
  getDailySales,
  getMonthlySales,
  getDashboardStats,
  getTopItems,
  getRevenueTimeline,
  getSalesReportData
} = require("../controllers/salesController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/reports", auth, role("admin"), getSalesReportData);

router.use(auth, role("admin"));

router.get("/daily", getDailySales);
router.get("/monthly", getMonthlySales);
router.get("/dashboard", getDashboardStats);
router.get("/top-items", getTopItems);
router.get("/timeline", getRevenueTimeline);

// Admin-only manual trigger for Daily Reset System
const { runDailyReset } = require("../services/resetService");
router.post("/reset/daily", async (req, res, next) => {
  try {
    await runDailyReset();
    res.json({ success: true, message: "Daily reset completed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
