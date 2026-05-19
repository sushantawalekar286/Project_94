const router = require("express").Router();
const { create, list, monthly } = require("../controllers/expenseController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth);

// Admins can create and view expenses
router.post("/", role("admin"), create);
router.get("/", role("admin"), list);
router.get("/monthly", role("admin"), monthly);

module.exports = router;
