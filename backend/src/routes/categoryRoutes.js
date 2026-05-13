const router = require("express").Router();
const { listCategories, createCategory } = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", listCategories);
router.post("/", auth, role("admin"), createCategory);

module.exports = router;
