const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config({ path: "../../.env" }); // Support running from seed dir

const seedAdmin = async () => {
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  await User.findOneAndUpdate(
    { email: "admin@restaurant.com" },
    { name: "Admin", email: "admin@restaurant.com", password: passwordAdmin, role: "admin" },
    { upsert: true, new: true }
  );

  const passwordChef = await bcrypt.hash("chef123", 10);
  await User.findOneAndUpdate(
    { email: "chef@restaurant.com" },
    { name: "Chef", email: "chef@restaurant.com", password: passwordChef, role: "chef" },
    { upsert: true, new: true }
  );
  console.log("✅ Admin & Chef seeded successfully.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => seedAdmin())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = seedAdmin;
