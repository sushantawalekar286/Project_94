const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const password = await bcrypt.hash("admin123", 10);
  await User.findOneAndUpdate(
    { email: "admin@restaurant.com" },
    { name: "Admin", email: "admin@restaurant.com", password, role: "admin" },
    { upsert: true, new: true }
  );
  await User.findOneAndUpdate(
    { email: "chef@restaurant.com" },
    { name: "Chef", email: "chef@restaurant.com", password, role: "chef" },
    { upsert: true, new: true }
  );
  await mongoose.disconnect();
};

run();
