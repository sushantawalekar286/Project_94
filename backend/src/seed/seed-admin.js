require("../utils/dnsHelper");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const seedAdmin = async () => {
  // Clear any existing accounts to satisfy deactivation/deletion of old demo/test accounts
  await User.deleteMany({});

  const passwordAdmin = await bcrypt.hash("Amar@94", 10);
  await User.create({
    name: "Admin Amar",
    email: "amar94cafe@gmail.com",
    password: passwordAdmin,
    role: "admin"
  });

  const passwordWaiter = await bcrypt.hash("Raj@94", 10);
  await User.create({
    name: "Waiter Raj",
    email: "raj94cafe@gmail.com",
    password: passwordWaiter,
    role: "waiter"
  });

  const passwordChef = await bcrypt.hash("Chef@94", 10);
  await User.create({
    name: "Chef",
    email: "chef94cafe@gmail.com",
    password: passwordChef,
    role: "chef"
  });

  console.log("✅ New default Admin, Waiter, and Chef accounts seeded successfully.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => seedAdmin())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = seedAdmin;
