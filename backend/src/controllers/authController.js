const { registerUser, loginUser } = require("../services/authService");
const env = require('../config/env');

const register = async (req, res, next) => {
  try {
    console.log(`[AUTH REQUEST] Admin ${req.user?.id} is registering new user with email: ${req.body.email}`);
    const adminId = req.user?.id;
    const result = await registerUser(req.body, env.JWT_SECRET, adminId);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error(`[AUTH ERROR] Registration failed for ${req.body.email || "unknown"}: ${error.message}`);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log(`[AUTH REQUEST] Login request received for email: ${req.body.email}`);
    const result = await loginUser(req.body, env.JWT_SECRET);

    // Set refresh token as httpOnly secure cookie
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      // Don't leak refreshToken in long-term logs but return for dev clients
    }

    console.log(`[AUTH REQUEST] Login successful for email: ${req.body.email} (Role: ${result.user?.role})`);
    res.json({ success: true, user: result.user, token: result.token, refreshToken: result.refreshToken });
  } catch (error) {
    console.error(`[AUTH ERROR] Login failed for email ${req.body.email || "unknown"}: ${error.message}`);
    next(error);
  }
};

module.exports = { register, login };
