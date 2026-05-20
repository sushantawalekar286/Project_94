const jwt = require("jsonwebtoken");
const env = require("../config/env");

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    console.warn(`[AUTH REQUEST] Missing Authorization token for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    console.log(`[AUTH REQUEST] User successfully authenticated: ${req.user.id} (Role: ${req.user.role}) for ${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    console.warn(`[AUTH REQUEST] Token verification failed for ${req.method} ${req.originalUrl}: ${error.message}`);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
