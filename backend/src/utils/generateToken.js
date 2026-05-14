const jwt = require("jsonwebtoken");
const env = require("../config/env");

// Default access token expiry (short-lived)
const DEFAULT_EXP = process.env.ACCESS_TOKEN_EXP || '15m';

const generateToken = (payload, secret = env.JWT_SECRET, expiresIn = DEFAULT_EXP) =>
  jwt.sign(payload, secret, { expiresIn });

module.exports = generateToken;
