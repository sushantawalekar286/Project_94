require("../utils/dnsHelper");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const Order = require("../models/Order");
const Expense = require("../models/Expense");
const Sale = require("../models/Sale");
const MenuItem = require("../models/MenuItem");

const resetBusinessData = async () => {
  console.log("🧹 Starting business data cleanup and statistics reset...");

  try {
    // 1. Delete all orders
    const ordersResult = await Order.deleteMany({});
    console.log(`- Cleared Orders: deleted ${ordersResult.deletedCount} documents.`);

    // 2. Delete all sales
    const salesResult = await Sale.deleteMany({});
    console.log(`- Cleared Sales: deleted ${salesResult.deletedCount} documents.`);

    // 3. Delete all expenses
    const expensesResult = await Expense.deleteMany({});
    console.log(`- Cleared Expenses: deleted ${expensesResult.deletedCount} documents.`);

    // 4. Delete native inventorytransactions if the collection exists
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: "inventorytransactions" }).toArray();
    if (collections.length > 0) {
      const invTransResult = await db.collection("inventorytransactions").deleteMany({});
      console.log(`- Cleared InventoryTransactions: deleted ${invTransResult.deletedCount} documents.`);
    } else {
      console.log(`- InventoryTransactions collection does not exist.`);
    }

    // 5. Reset counters on MenuItem
    const menuItemsResult = await MenuItem.updateMany(
      {},
      { $set: { totalOrders: 0, totalQuantitySold: 0 } }
    );
    console.log(`- Reset MenuItem counters (totalOrders and totalQuantitySold) for ${menuItemsResult.modifiedCount} items.`);

    console.log("✅ Business data and dashboard statistics reset finished successfully.");
  } catch (error) {
    console.error("❌ Error during business data reset:", error);
    throw error;
  }
};

if (require.main === module) {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital-waiter";
  console.log(`Connecting to database...`);
  
  mongoose.connect(uri)
    .then(() => resetBusinessData())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = resetBusinessData;
