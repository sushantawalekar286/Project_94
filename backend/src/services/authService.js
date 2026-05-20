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
  console.log(`[MONGO SAVE] Successfully registered new user: ${user.email} (Role: ${user.role}, ID: ${user._id})`);
  
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

  // Create refresh token as a JWT and persist its SHA-256 hash (fast DB lookup)
  const refreshToken = generateToken({ id: user._id }, jwtSecret, '30d');
  const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.refreshTokenHash = refreshHash;
  await user.save();
  console.log(`[MONGO SAVE] Saved user: ${user.email} (ID: ${user._id}) successfully after updating refresh token hash.`);

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
