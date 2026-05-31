require("../utils/dnsHelper");
const mongoose = require("mongoose");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const seedOrders = async () => {
  const table = await Table.findOne({ number: 1 });
  const biryani = await MenuItem.findOne({ name: "Biryani Combo" });
  const coffee = await MenuItem.findOne({ name: "Cold Coffee" });

  if (!table || !biryani || !coffee) {
    console.log("⚠️ Skipping orders seed: Missing dependencies.");
    return;
  }

  const orderCount = await Order.countDocuments();
  if (orderCount > 0) {
    console.log("⏭️  Orders collection is not empty, skipping orders seeding");
    return;
  }

  const biryaniPrice = biryani.pricingType === "half-full" ? biryani.halfPrice : biryani.singlePrice || biryani.price;
  const coffeePrice = coffee.singlePrice || coffee.price;

  const items = [
    { menuItem: biryani._id, name: biryani.name, price: biryaniPrice, quantity: 2, portionType: "half" },
    { menuItem: coffee._id, name: coffee.name, price: coffeePrice, quantity: 2, portionType: "single" }
  ];

  const subtotal = (biryaniPrice * 2) + (coffeePrice * 2);
  const tax = 0;
  const total = subtotal;

  await Order.create({
    table: table._id,
    tableNumber: table.number,
    items,
    status: "Pending",
    subtotal,
    tax,
    total
  });

  console.log("✅ Sample orders seeded successfully.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => seedOrders())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = seedOrders;
