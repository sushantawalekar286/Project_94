const mongoose = require("mongoose");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
require("dotenv").config({ path: "../../.env" });

const seedOrders = async () => {
  const table = await Table.findOne({ number: 1 });
  const burger = await MenuItem.findOne({ name: "Chicken Burger" });
  const coke = await MenuItem.findOne({ name: "Coke" });

  if (!table || !burger || !coke) {
    console.log("⚠️ Skipping orders seed: Missing dependencies.");
    return;
  }

  // Clear existing to avoid clutter during repeated seeds
  await Order.deleteMany({});

  const items = [
    { menuItem: burger._id, name: burger.name, price: burger.price, quantity: 2 },
    { menuItem: coke._id, name: coke.name, price: coke.price, quantity: 2 }
  ];

  const subtotal = (burger.price * 2) + (coke.price * 2);
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = subtotal + tax;

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
