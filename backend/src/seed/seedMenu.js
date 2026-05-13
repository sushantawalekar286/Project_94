const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const Inventory = require("../models/Inventory");

const menu = {
  Pizza: [
    ["Margherita Pizza", "San Marzano tomato, basil, mozzarella", 299, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80"],
    ["Truffle Farmhouse", "Mushrooms, peppers, onion, truffle oil", 389, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80"],
    ["Smoked Paneer Pizza", "Charred paneer, paprika, golden cheese", 349, "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80"]
  ],
  Burgers: [
    ["Classic Bistro Burger", "Toasted bun, chef sauce, crisp lettuce", 249, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"],
    ["Crispy Veg Burger", "Crunchy patty, cheddar, house relish", 219, "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80"],
    ["Spicy Royal Burger", "Jalapeno, smoked sauce, caramelized onion", 289, "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80"]
  ],
  Fries: [
    ["Golden Fries", "Crisp potato fries with sea salt", 129, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"],
    ["Peri Peri Fries", "Spicy seasoning and garlic dip", 159, "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80"],
    ["Loaded Cheese Fries", "Cheese sauce, herbs, toasted crumbs", 199, "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=900&q=80"]
  ],
  Beverages: [
    ["Sparkling Lemonade", "Fresh lemon, soda, mint", 99, "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80"],
    ["Cold Coffee", "Creamy coffee over ice", 149, "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80"],
    ["Orange Gold Cooler", "Citrus, honey, crushed ice", 129, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80"]
  ]
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const [categoryName, items] of Object.entries(menu)) {
    const category = await Category.findOneAndUpdate(
      { name: categoryName },
      { name: categoryName, description: `${categoryName} prepared fresh for table orders` },
      { upsert: true, new: true }
    );
    for (const [name, description, price, imageUrl] of items) {
      await MenuItem.findOneAndUpdate(
        { name },
        { name, description, price, imageUrl, category: category._id, isAvailable: true },
        { upsert: true, new: true }
      );
    }
  }
  for (const item of [
    { name: "Cheese", unit: "kg", stock: 20, lowStockThreshold: 5 },
    { name: "Flour", unit: "kg", stock: 30, lowStockThreshold: 8 },
    { name: "Potatoes", unit: "kg", stock: 24, lowStockThreshold: 6 },
    { name: "Burger Buns", unit: "pcs", stock: 60, lowStockThreshold: 15 },
    { name: "Cold Beverage Syrup", unit: "ltr", stock: 10, lowStockThreshold: 3 }
  ]) {
    await Inventory.findOneAndUpdate({ name: item.name }, item, { upsert: true, new: true });
  }
  await mongoose.disconnect();
};

run();
