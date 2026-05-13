const router = require("express").Router();
const {
  listInventory,
  updateInventory,
  getLowStock,
  restockInventory,
  getInventoryHistory
} = require("../controllers/inventoryController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// All inventory routes require authentication
router.use(auth);

router.get("/", role("admin", "chef"), listInventory);
router.get("/low-stock", role("admin"), getLowStock);
router.get("/:id/history", role("admin"), getInventoryHistory);
router.patch("/:id", role("admin"), updateInventory);
router.post("/:id/restock", role("admin"), restockInventory);

module.exports = router;
