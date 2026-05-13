const jwt = require("jsonwebtoken");

const generateToken = (payload, secret, expiresIn = "7d") =>
  jwt.sign(payload, secret, { expiresIn });

module.exports = generateToken;
