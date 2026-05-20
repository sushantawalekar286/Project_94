const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token is required" });

    // 1. Verify JWT refresh token (extremely fast, doesn't block event loop)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_SECRET);
    } catch (err) {
      console.warn(`[REFRESH ERROR] JWT verification failed: ${err.message}`);
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    // 2. Hash incoming token with SHA-256 and look up user directly by ID & hash (fast indexed query)
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findOne({ _id: decoded.id, refreshTokenHash: refreshHash });
    
    if (!user) {
      console.warn(`[REFRESH ERROR] No user found matching the refresh token hash for user ID: ${decoded.id}`);
      return res.status(401).json({ success: false, message: "Invalid session or token mismatch" });
    }

    // 3. Issue new access token with role preserved for route guards
    const accessToken = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: '15m' });

    // 4. Rotate refresh token (Generate a new JWT and save its SHA-256 hash)
    const newRefresh = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: '30d' });
    user.refreshTokenHash = crypto.createHash('sha256').update(newRefresh).digest('hex');
    await user.save();
    
    console.log(`[MONGO SAVE] Rotated refresh token for user: ${user.email} (ID: ${user._id})`);

    res.json({ 
      success: true, 
      accessToken, 
      refreshToken: newRefresh, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        createdAt: user.createdAt 
      } 
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { refresh };
