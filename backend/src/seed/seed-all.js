const mongoose = require("mongoose");
const seedAdmin = require("./seed-admin");
const seedTables = require("./seed-tables");
const seedInventory = require("./seed-inventory");
const seedMenu = require("./seed-menu");
const seedOrders = require("./seed-orders");
require("dotenv").config({ path: "../../.env" });

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter");
    console.log("🌱 Starting complete database seed...");
    
    await seedAdmin();
    await seedTables();
    await seedInventory();
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
