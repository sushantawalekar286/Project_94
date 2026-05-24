const router = require("express").Router();
const { listTables, updateTableStatus } = require("../controllers/tableController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, role("admin", "waiter"), listTables);
router.patch("/:id/status", auth, role("admin", "waiter"), updateTableStatus);

module.exports = router;
