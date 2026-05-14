const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false });

    // Find user by matching stored hash
    const users = await User.find().select('+refreshTokenHash');
    const user = users.find(u => bcrypt.compareSync(refreshToken, u.refreshTokenHash || ''));
    if (!user) return res.status(401).json({ success: false });

    // Issue new access token
    const accessToken = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: '15m' });

    // Rotate refresh token
    const newRefresh = crypto.randomBytes(64).toString('hex');
    user.refreshTokenHash = bcrypt.hashSync(newRefresh, 10);
    await user.save();

    res.json({ success: true, accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
};

module.exports = { refresh };
