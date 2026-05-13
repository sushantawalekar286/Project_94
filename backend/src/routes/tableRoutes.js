const router = require("express").Router();
const { listTables } = require("../controllers/tableController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, role("admin"), listTables);

module.exports = router;
