const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");
require("dotenv").config({ path: "../../.env" });

const inventoryData = [
  { name: "Bread", unit: "pcs", stock: 5, lowStockThreshold: 10 },
  { name: "Cheese", unit: "slice", stock: 200, lowStockThreshold: 30 },
  { name: "Patty", unit: "pcs", stock: 150, lowStockThreshold: 25 },
  { name: "Coffee Powder", unit: "g", stock: 5000, lowStockThreshold: 500 },
  { name: "Milk", unit: "ml", stock: 20000, lowStockThreshold: 2000 },
  { name: "Sugar", unit: "g", stock: 10000, lowStockThreshold: 1000 },
  { name: "Pizza Base", unit: "pcs", stock: 80, lowStockThreshold: 15 },
  { name: "Sauce", unit: "ml", stock: 5000, lowStockThreshold: 500 },
  { name: "Coke", unit: "ml", stock: 30000, lowStockThreshold: 5000 },
  { name: "Ice Cream", unit: "scoop", stock: 150, lowStockThreshold: 20 }
];

const seedInventory = async () => {
  for (const item of inventoryData) {
    await Inventory.findOneAndUpdate(
      { name: item.name },
      item,
      { upsert: true, new: true }
    );
  }
  console.log("✅ Inventory seeded successfully.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => seedInventory())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = seedInventory;
