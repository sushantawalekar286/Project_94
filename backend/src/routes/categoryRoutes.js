const router = require("express").Router();
const { listCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", listCategories);
router.post("/", auth, role("admin"), createCategory);
router.put("/:id", auth, role("admin"), updateCategory);
router.delete("/:id", auth, role("admin"), deleteCategory);

module.exports = router;
