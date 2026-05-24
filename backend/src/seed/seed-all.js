require("../utils/dnsHelper");
const mongoose = require("mongoose");
const seedAdmin = require("./seed-admin");
const seedTables = require("./seed-tables");
const seedMenu = require("./seed-menu");
const seedOrders = require("./seed-orders");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter");
    console.log("🌱 Starting complete database seed...");
    
    await seedAdmin();
    await seedTables();
    await seedMenu();
    await seedOrders();

    console.log("🚀 All demo data seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAll();
