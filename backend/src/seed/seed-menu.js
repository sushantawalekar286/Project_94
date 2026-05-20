const mongoose = require("mongoose");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
// Inventory and Recipe removed — seed only menu items and categories
require("dotenv").config({ path: "../../.env" });

const categoriesData = ["Appetizers", "Soups", "Curries", "Biryanis", "Breads", "Tandoori", "Vegetarian", "Seafood", "Desserts", "Beverages"];

const menuData = [
  { name: "Samosa", category: "Appetizers", pricingType: "single", singlePrice: 80, description: "Crispy fried pastry with potato filling", image: "https://images.unsplash.com/photo-1625757818487-88d1b6b8d1d4?w=500" },
  { name: "Paneer Butter Masala", category: "Curries", pricingType: "single", singlePrice: 280, description: "Creamy tomato gravy with cottage cheese", image: "https://images.unsplash.com/photo-1589308078054-832d7c1320a8?w=500" },
  { name: "Biryani Combo", category: "Biryanis", pricingType: "half-full", halfPrice: 180, fullPrice: 299, description: "Flexible half or full serving", image: "https://images.unsplash.com/photo-1563379091339-03246963d6b5?w=500" },
  { name: "Garlic Naan", category: "Breads", pricingType: "single", singlePrice: 80, description: "Soft naan brushed with garlic butter", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500" },
  { name: "Tandoori Paneer", category: "Tandoori", pricingType: "half-full", halfPrice: 210, fullPrice: 340, description: "Paneer cubes marinated and grilled", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500" },
  { name: "Cold Coffee", category: "Beverages", pricingType: "single", singlePrice: 149, description: "Chilled blended coffee with milk", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500" },
  { name: "Gulab Jamun", category: "Desserts", pricingType: "single", singlePrice: 100, description: "Milk solids in sugar syrup", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500" }
];

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
        pricingType: item.pricingType || "single",
        price: item.pricingType === "half-full" ? item.fullPrice : item.singlePrice,
        singlePrice: item.singlePrice ?? item.fullPrice ?? item.price,
        halfPrice: item.halfPrice ?? null,
        fullPrice: item.fullPrice ?? item.singlePrice ?? item.price,
        description: item.description, 
        imageUrl: item.image,
        isAvailable: true,
        available: true
      },
      { upsert: true, new: true }
    );

    // No recipe/inventory seeding — menu items are standalone now
  }
  console.log("✅ Categories and menu items seeded successfully.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => seedMenu())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = seedMenu;
