const mongoose = require("mongoose");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const Inventory = require("../models/Inventory");
const Recipe = require("../models/Recipe");
require("dotenv").config({ path: "../../.env" });

const categoriesData = ["Burgers", "Pizza", "Drinks", "Desserts", "Coffee"];

const menuData = [
  { name: "Chicken Burger", category: "Burgers", price: 249, description: "Juicy chicken patty with cheese", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" },
  { name: "Veg Burger", category: "Burgers", price: 199, description: "Crispy veg patty with fresh lettuce", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500" },
  { name: "Margherita Pizza", category: "Pizza", price: 299, description: "Classic tomato sauce and mozzarella", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500" },
  { name: "Cold Coffee", category: "Coffee", price: 149, description: "Chilled blended coffee with milk", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500" },
  { name: "Cappuccino", category: "Coffee", price: 129, description: "Hot espresso with steamed milk foam", image: "https://images.unsplash.com/photo-1534687941688-129f95d8869c?w=500" },
  { name: "Coke", category: "Drinks", price: 99, description: "Chilled Coca-Cola", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500" },
  { name: "Brownie", category: "Desserts", price: 179, description: "Warm chocolate brownie with ice cream", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500" }
];

const recipeData = {
  "Chicken Burger": [{ name: "Bread", qty: 2 }, { name: "Cheese", qty: 1 }, { name: "Patty", qty: 1 }, { name: "Sauce", qty: 20 }],
  "Veg Burger": [{ name: "Bread", qty: 2 }, { name: "Cheese", qty: 1 }, { name: "Patty", qty: 1 }, { name: "Sauce", qty: 20 }],
  "Margherita Pizza": [{ name: "Pizza Base", qty: 1 }, { name: "Cheese", qty: 3 }, { name: "Sauce", qty: 50 }],
  "Cold Coffee": [{ name: "Coffee Powder", qty: 15 }, { name: "Milk", qty: 250 }, { name: "Sugar", qty: 20 }, { name: "Ice Cream", qty: 1 }],
  "Cappuccino": [{ name: "Coffee Powder", qty: 15 }, { name: "Milk", qty: 150 }, { name: "Sugar", qty: 10 }],
  "Coke": [{ name: "Coke", qty: 330 }],
  "Brownie": [{ name: "Ice Cream", qty: 1 }] // (Assuming brownie base is pre-made)
};

const seedMenu = async () => {
  // Categories
  const categoryMap = {};
  for (const name of categoriesData) {
    const cat = await Category.findOneAndUpdate(
      { name },
      { name, description: `Delicious ${name}` },
      { upsert: true, new: true }
    );
    categoryMap[name] = cat._id;
  }

  // Menu Items & Recipes
  for (const item of menuData) {
    const menuItem = await MenuItem.findOneAndUpdate(
      { name: item.name },
      { 
        name: item.name, 
        category: categoryMap[item.category], 
        price: item.price, 
        description: item.description, 
        imageUrl: item.image,
        isAvailable: true 
      },
      { upsert: true, new: true }
    );

    // Recipes
    const ingredients = recipeData[item.name];
    if (ingredients) {
      // Clear old recipes to avoid duplicates
      await Recipe.deleteMany({ menuItem: menuItem._id });
      
      const recipeRecords = [];
      for (const ing of ingredients) {
        const inventoryItem = await Inventory.findOne({ name: ing.name });
        if (inventoryItem) {
          await Recipe.create({
            menuItem: menuItem._id,
            inventoryItem: inventoryItem._id,
            quantity: ing.qty
          });
          recipeRecords.push({ inventoryItem: inventoryItem._id, quantity: ing.qty });
        }
      }
      
      // Update menuItem ingredients array for easy population (redundant but matches existing schema)
      await MenuItem.findByIdAndUpdate(menuItem._id, { ingredients: recipeRecords });
    }
  }
  console.log("✅ Categories, Menu Items, and Recipes seeded successfully.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => seedMenu())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = seedMenu;
