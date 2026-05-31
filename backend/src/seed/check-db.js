require("../utils/dnsHelper");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/Table");
const User = require("../models/User");

const check = async () => {
  console.log("Checking DB Status...");
  const uri = process.env.MONGODB_URI;
  console.log("URI:", uri.replace(/:([^:@]+)@/, ":***@"));
  try {
    await mongoose.connect(uri);
    
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const menuCount = await MenuItem.countDocuments();
    const tableCount = await Table.countDocuments();
    
    console.log(`- Users count: ${userCount}`);
    console.log(`- Categories count: ${categoryCount}`);
    console.log(`- MenuItems count: ${menuCount}`);
    console.log(`- Tables count: ${tableCount}`);
    
    const tables = await Table.find({}).sort({ number: 1 });
    console.log("\nTable Details:");
    tables.forEach((t) => {
      console.log(`  Table #${t.number} (tableNumber: ${t.tableNumber}) -> URL: ${t.qrCodeUrl} [Has image: ${!!t.qrImage}]`);
    });
  } catch (error) {
    console.error("Error checking db:", error);
  } finally {
    await mongoose.disconnect();
  }
};

check();
