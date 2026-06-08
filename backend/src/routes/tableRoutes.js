const router = require("express").Router();
const { listTables, updateTableStatus } = require("../controllers/tableController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, role("admin", "waiter", "chef"), listTables);
router.patch("/:id/status", auth, role("admin", "waiter", "chef"), updateTableStatus);

module.exports = router;
