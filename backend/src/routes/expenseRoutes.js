const router = require("express").Router();
const { create, list, update, remove, monthly, summary } = require("../controllers/expenseController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth);

// Admins can create and view expenses
router.post("/", role("admin"), create);
router.get("/", role("admin"), list);
router.get("/summary", role("admin"), summary);
router.get("/monthly", role("admin"), monthly);
router.put("/:id", role("admin"), update);
router.delete("/:id", role("admin"), remove);

module.exports = router;
