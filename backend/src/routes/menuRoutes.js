const router = require("express").Router();
const { listMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require("../controllers/menuController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { menuSchema } = require("../validators/menuValidator");

router.get("/", listMenu);
router.post("/", auth, role("admin"), validate(menuSchema), createMenuItem);
router.put("/:id", auth, role("admin"), validate(menuSchema), updateMenuItem);
router.delete("/:id", auth, role("admin"), deleteMenuItem);

module.exports = router;
