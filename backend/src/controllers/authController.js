const { registerUser, loginUser } = require("../services/authService");
const env = require('../config/env');

const register = async (req, res, next) => {
  let hasError = false;
  try {
    console.log(`[AUTH REQUEST] Admin ${req.user?.id} is registering new user with email: ${req.body.email}`);
    const adminId = req.user?.id;
    const result = await registerUser(req.body, env.JWT_SECRET, adminId);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    hasError = true;
    console.error(error);
    console.error(`[AUTH ERROR] Registration failed for ${req.body.email || "unknown"}: ${error.message}`);
    next(error);
  } finally {
    console.log(`[AUTH REGISTER FINALLY] Completed registration attempt. Success: ${!hasError}`);
  }
};

const login = async (req, res, next) => {
  let token = null;
  let user = null;
  let result = null;
  try {
    console.log(req.body);
    const authResult = await loginUser(req.body, env.JWT_SECRET);
    result = authResult;
    token = authResult.token;
    user = authResult.user;

    // Set refresh token as httpOnly secure cookie
    if (authResult.refreshToken) {
      res.cookie('refreshToken', authResult.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    console.log(user);
    console.log(token);

    return res.status(200).json({
      success: true,
      token,
      user,
      refreshToken: authResult.refreshToken
    });
  } catch (error) {
    console.error(error);
    next(error);
  } finally {
    console.log(`[AUTH LOGIN FINALLY] Completed login attempt for: ${req.body?.email || "unknown"}`);
  }
};

module.exports = { register, login };
