const { registerUser, loginUser } = require("../services/authService");

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
    const result = await loginUser(req.body, process.env.JWT_SECRET);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
