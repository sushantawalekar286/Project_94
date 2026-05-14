const rateLimit = require('express-rate-limit');

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // limit each IP to 8 requests per windowMs
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

module.exports = authLimiter;
