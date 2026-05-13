const router = require("express").Router();
const { login, register } = require("../controllers/authController");
const validate = require("../middleware/validateMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { loginSchema, registerSchema } = require("../validators/authValidator");

router.post("/login", validate(loginSchema), login);
// Register endpoint is admin-only (requires JWT token + admin role)
router.post("/register", authMiddleware, roleMiddleware("admin"), validate(registerSchema), register);

module.exports = router;
