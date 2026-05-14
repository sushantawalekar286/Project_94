const { registerUser, loginUser } = require("../services/authService");
const env = require('../config/env');

const register = async (req, res, next) => {
  try {
    // Only admin can register new users
    const adminId = req.user?.id;
    const result = await registerUser(req.body, process.env.JWT_SECRET, adminId);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body, env.JWT_SECRET);

    // Set refresh token as httpOnly secure cookie
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      // Don't leak refreshToken in long-term logs but return for dev clients
    }

    res.json({ success: true, user: result.user, token: result.token, refreshToken: result.refreshToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
