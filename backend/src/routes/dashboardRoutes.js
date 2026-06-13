const router = require("express").Router();
const { getTodayDashboardStats } = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/today", auth, role("admin"), getTodayDashboardStats);

module.exports = router;
