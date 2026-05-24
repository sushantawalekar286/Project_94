require("../utils/dnsHelper");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const Category = require("../models/Category");
const Expense = require("../models/Expense");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const QRCode = require("../models/QRCode");
const Sale = require("../models/Sale");
const Table = require("../models/Table");
const User = require("../models/User");

const cleanDataOnly = async () => {
  console.log("🧹 Starting database cleanup (App Data Only)...");

  try {
    const ordersResult = await Order.deleteMany({});
    console.log(`- Cleared Orders: deleted ${ordersResult.deletedCount} documents.`);

    const menuItemsResult = await MenuItem.deleteMany({});
    console.log(`- Cleared MenuItems: deleted ${menuItemsResult.deletedCount} documents.`);

    const categoriesResult = await Category.deleteMany({});
    console.log(`- Cleared Categories: deleted ${categoriesResult.deletedCount} documents.`);

    const expensesResult = await Expense.deleteMany({});
    console.log(`- Cleared Expenses: deleted ${expensesResult.deletedCount} documents.`);

    const qrCodesResult = await QRCode.deleteMany({});
    console.log(`- Cleared QRCodes: deleted ${qrCodesResult.deletedCount} documents.`);

    const salesResult = await Sale.deleteMany({});
    console.log(`- Cleared Sales: deleted ${salesResult.deletedCount} documents.`);

    const tablesResult = await Table.deleteMany({});
    console.log(`- Cleared Tables: deleted ${tablesResult.deletedCount} documents.`);

    const userCount = await User.countDocuments({});
    console.log(`- Keep: Users collection untouched (${userCount} users registered).`);

    console.log("✅ Cleanup process finished successfully.");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    throw error;
  }
};

if (require.main === module) {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter";
  console.log(`Connecting to ${uri.replace(/:([^:@]+)@/, ":***@")}...`);
  
  mongoose.connect(uri)
    .then(() => cleanDataOnly())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = cleanDataOnly;
