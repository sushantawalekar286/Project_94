const router = require("express").Router();
const { listQRCodes, generateQRCodes, generateQRForTable } = require("../controllers/qrController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth, role("admin"));

router.get("/", listQRCodes);
router.post("/generate", generateQRCodes);
router.post("/generate/:tableId", generateQRForTable);

module.exports = router;
