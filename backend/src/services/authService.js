const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async ({ name, email, password, role }, jwtSecret, adminId = null) => {
  // Security: Only admins can create users
  if (!adminId) {
    throw Object.assign(new Error("Only admins can create users"), { statusCode: 403 });
  }
  
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error("Email already in use"), { statusCode: 400 });
  
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ 
    name, 
    email, 
    password: hashed, 
    role: role || "chef"
  });
  
  return { 
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    token: generateToken({ id: user._id, role: user.role }, jwtSecret) 
  };
};

const crypto = require('crypto');
const loginUser = async ({ email, password }, jwtSecret) => {
  const user = await User.findOne({ email }).select("+password +refreshTokenHash");
  if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  // Create refresh token and persist its hash
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = refreshHash;
  await user.save();

  return { 
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    token: generateToken({ id: user._id, role: user.role }, jwtSecret),
    refreshToken
  };
};

module.exports = { registerUser, loginUser };
