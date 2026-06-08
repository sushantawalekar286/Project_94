#!/usr/bin/env node

/**
 * COMPREHENSIVE SEED DATA - Complete System Setup
 * 
 * Creates:
 * - Admin account: admin@restaurant.com / admin123
 * - 3 Chef accounts with credentials
 * - 5 Waiter accounts with credentials
 * - Full realistic menu (50+ items)
 * - Complete ingredient database
 * - Tables 1-50 with QR codes
 */

require("../utils/dnsHelper");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: __dirname + "/../../.env" });

// Import models
const User = require("../models/User");
const Table = require("../models/Table");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const QRCode = require("../models/QRCode");

const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_URL = process.env.CLIENT_URL || "https://project-94-two.vercel.app";

if (require.main === module && !MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}


// Menu categories
const CATEGORIES = [
  "Appetizers",
  "Soups",
  "Curries",
  "Biryanis",
  "Breads",
  "Tandoori",
  "Vegetarian",
  "Seafood",
  "Desserts",
  "Beverages"
];

// Sample menu items
const MENU_ITEMS = [
  { name: "Samosa", category: "Appetizers", pricingType: "single", singlePrice: 80, description: "Crispy fried pastry with potato filling", prep: 8, spice: 2, veg: true },
  { name: "Pakora", category: "Appetizers", pricingType: "single", singlePrice: 100, description: "Battered and fried vegetables", prep: 10, spice: 2, veg: true },
  { name: "Spring Rolls", category: "Appetizers", pricingType: "single", singlePrice: 120, description: "Crispy rolls with vegetable filling", prep: 8, spice: 1, veg: true },
  { name: "Tomato Soup", category: "Soups", pricingType: "single", singlePrice: 120, description: "Creamy tomato bisque", prep: 12, spice: 1, veg: true },
  { name: "Mulligatawny", category: "Soups", pricingType: "single", singlePrice: 150, description: "Spiced lentil soup", prep: 15, spice: 3, veg: true },
  { name: "Paneer Butter Masala", category: "Curries", pricingType: "single", singlePrice: 280, description: "Cottage cheese in creamy tomato gravy", prep: 20, spice: 2, veg: true },
  { name: "Chana Masala", category: "Curries", pricingType: "single", singlePrice: 220, description: "Chickpeas in aromatic sauce", prep: 18, spice: 3, veg: true },
  { name: "Dal Makhani", category: "Curries", pricingType: "single", singlePrice: 200, description: "Creamy lentil curry", prep: 25, spice: 1, veg: true },
  { name: "Baingan Bharta", category: "Curries", pricingType: "single", singlePrice: 220, description: "Roasted eggplant curry", prep: 22, spice: 2, veg: true },
  { name: "Chicken Tikka Masala", category: "Curries", pricingType: "single", singlePrice: 320, description: "Tender chicken in creamy sauce", prep: 20, spice: 2, veg: false },
  { name: "Butter Chicken", category: "Curries", pricingType: "single", singlePrice: 300, description: "Chicken in butter and cream sauce", prep: 18, spice: 1, veg: false },
  { name: "Chettinad Chicken", category: "Curries", pricingType: "single", singlePrice: 320, description: "Spicy chicken curry from South India", prep: 22, spice: 4, veg: false },
  { name: "Fish Curry", category: "Curries", pricingType: "single", singlePrice: 350, description: "Fish in coconut-based sauce", prep: 20, spice: 3, veg: false },
  { name: "Biryani - Chicken", category: "Biryanis", pricingType: "half-full", halfPrice: 180, fullPrice: 280, description: "Fragrant rice with chicken", prep: 30, spice: 2, veg: false },
  { name: "Biryani - Paneer", category: "Biryanis", pricingType: "half-full", halfPrice: 170, fullPrice: 260, description: "Fragrant rice with cottage cheese", prep: 28, spice: 1, veg: true },
  { name: "Dum Biryani", category: "Biryanis", pricingType: "half-full", halfPrice: 210, fullPrice: 320, description: "Traditional dum-cooked biryani", prep: 35, spice: 2, veg: false },
  { name: "Naan", category: "Breads", pricingType: "single", singlePrice: 60, description: "Traditional Indian bread", prep: 5, spice: 0, veg: true },
  { name: "Garlic Naan", category: "Breads", pricingType: "single", singlePrice: 80, description: "Naan with garlic", prep: 6, spice: 0, veg: true },
  { name: "Roti", category: "Breads", pricingType: "single", singlePrice: 40, description: "Whole wheat bread", prep: 4, spice: 0, veg: true },
  { name: "Paratha", category: "Breads", pricingType: "single", singlePrice: 70, description: "Flaky layered bread", prep: 8, spice: 0, veg: true },
  { name: "Bhatura", category: "Breads", pricingType: "single", singlePrice: 90, description: "Fried Indian bread", prep: 10, spice: 0, veg: true },
  { name: "Tandoori Chicken", category: "Tandoori", pricingType: "single", singlePrice: 380, description: "Marinated chicken cooked in clay oven", prep: 25, spice: 3, veg: false },
  { name: "Tandoori Paneer", category: "Tandoori", pricingType: "half-full", halfPrice: 210, fullPrice: 320, description: "Cottage cheese marinated and tandoori-cooked", prep: 20, spice: 2, veg: true },
  { name: "Seekh Kebab", category: "Tandoori", pricingType: "single", singlePrice: 300, description: "Minced meat kebabs", prep: 20, spice: 3, veg: false },
  { name: "Manchurian", category: "Vegetarian", pricingType: "single", singlePrice: 240, description: "Crispy paneer in tangy sauce", prep: 16, spice: 2, veg: true },
  { name: "Hakka Noodles", category: "Vegetarian", pricingType: "single", singlePrice: 200, description: "Stir-fried noodles with vegetables", prep: 12, spice: 2, veg: true },
  { name: "Fried Rice", category: "Vegetarian", pricingType: "single", singlePrice: 180, description: "Fragrant rice with vegetables", prep: 10, spice: 1, veg: true },
  { name: "Prawn Curry", category: "Seafood", pricingType: "single", singlePrice: 420, description: "Succulent prawns in sauce", prep: 18, spice: 3, veg: false },
  { name: "Gulab Jamun", category: "Desserts", pricingType: "single", singlePrice: 100, description: "Milk solids in sugar syrup", prep: 8, spice: 0, veg: true },
  { name: "Kheer", category: "Desserts", pricingType: "single", singlePrice: 120, description: "Rice pudding with cardamom", prep: 20, spice: 0, veg: true },
  { name: "Flan", category: "Desserts", pricingType: "single", singlePrice: 140, description: "Caramel custard", prep: 15, spice: 0, veg: true },
  { name: "Chai", category: "Beverages", pricingType: "single", singlePrice: 60, description: "Indian spiced tea", prep: 5, spice: 1, veg: true },
  { name: "Lassi", category: "Beverages", pricingType: "single", singlePrice: 80, description: "Yogurt-based drink", prep: 3, spice: 0, veg: true },
  { name: "Mango Lassi", category: "Beverages", pricingType: "single", singlePrice: 100, description: "Mango yogurt drink", prep: 5, spice: 0, veg: true },
];

const { generateForTable } = require("../services/qrService");

async function seedData() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Create users
    console.log("\n👥 Resetting users...");
    await User.deleteMany({});
    let seededUsersCount = 0;
    
    const adminPassword = await bcryptjs.hash("Amar@94", 10);
    const waiterPassword = await bcryptjs.hash("Raj@94", 10);
    const chefPassword = await bcryptjs.hash("Chef@94", 10);

    const usersData = [
      { name: "Admin Amar", email: "amar94cafe@gmail.com", password: adminPassword, role: "admin" },
      { name: "Waiter Raj", email: "raj94cafe@gmail.com", password: waiterPassword, role: "waiter" },
      { name: "Chef", email: "chef94cafe@gmail.com", password: chefPassword, role: "chef" }
    ];

    const users = await User.insertMany(usersData);
    seededUsersCount = users.length;
    console.log(`✅ Created ${users.length} users`);
    console.log("   Admin: amar94cafe@gmail.com / Amar@94");
    console.log("   Waiter: raj94cafe@gmail.com / Raj@94");
    console.log("   Chef: chef94cafe@gmail.com / Chef@94");

    // 2. Create categories if empty
    let categories = [];
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log("\n🏷️  Creating categories...");
      const categoriesData = CATEGORIES.map(name => ({ name }));
      categories = await Category.insertMany(categoriesData);
      console.log(`✅ Created ${categories.length} categories`);
    } else {
      console.log("⏭️  Categories collection is not empty, skipping categories seeding");
      categories = await Category.find();
    }

    // 3. Create menu items if empty
    let seededMenuItemsCount = 0;
    const menuItemCount = await MenuItem.countDocuments();
    if (menuItemCount === 0) {
      if (categories.length > 0) {
        console.log("\n🍽️  Creating menu items...");
        const menuItemsData = MENU_ITEMS.map(item => {
          const category = categories.find(c => c.name === item.category);
          return {
            name: item.name,
            description: item.description,
            price: item.singlePrice ?? item.fullPrice ?? item.price,
            pricingType: item.pricingType || "single",
            singlePrice: item.singlePrice ?? item.fullPrice ?? item.price,
            halfPrice: item.halfPrice ?? null,
            fullPrice: item.fullPrice ?? null,
            category: category ? category._id : null,
            preparationTime: item.prep,
            spiceLevel: item.spice,
            vegetarian: item.veg,
            vegan: false,
            imageUrl: `https://via.placeholder.com/300x200?text=${encodeURIComponent(item.name)}`,
            isAvailable: true,
            available: true,
            allergens: []
          };
        }).filter(item => item.category); // Only seed items that matched a valid category ID

        const menuItems = await MenuItem.insertMany(menuItemsData);
        seededMenuItemsCount = menuItems.length;
        console.log(`✅ Created ${menuItems.length} menu items`);
      } else {
        console.warn("⚠️  Skipping menu items: No categories found/seeded.");
      }
    } else {
      console.log("⏭️  Menu items collection is not empty, skipping menu items seeding");
    }

    // 5. Create tables if empty
    let tables = [];
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      console.log("\n🪑 Creating tables...");
      const tablesData = [];
      for (let i = 1; i <= 50; i++) {
        const token = crypto.randomBytes(16).toString("hex");
        const scannerId = `SCANNER-T${i}`;
        const qrId = `QR-TABLE-${i}`;
        
        const table = {
          number: i,
          tableNumber: i,
          token,
          status: "available",
          maxCapacity: i <= 10 ? 2 : i <= 30 ? 4 : 6,
          isActive: true,
          scannerId,
          qrId
        };
        tablesData.push(table);
      }
      tables = await Table.insertMany(tablesData);
      console.log(`✅ Created ${tables.length} tables`);
    } else {
      console.log("⏭️  Tables collection is not empty, skipping tables seeding");
      tables = await Table.find();
    }

    // 6. Create QR codes if empty
    let seededQRCodesCount = 0;
    const qrCount = await QRCode.countDocuments();
    if (qrCount === 0) {
      if (tables.length > 0) {
        console.log("📱 Generating QR codes...");
        for (const table of tables) {
          try {
            await generateForTable(table, CLIENT_URL);
            seededQRCodesCount++;
          } catch (error) {
            console.warn(`⚠️  Failed to generate QR for table ${table.number}:`, error.message);
          }
        }
        console.log(`✅ Generated QR codes for ${seededQRCodesCount} tables`);
      } else {
        console.warn("⚠️  Skipping QR codes: No tables found/seeded.");
      }
    } else {
      console.log("⏭️  QR codes collection is not empty, skipping QR codes seeding");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ SEED DATA COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Demo Credentials:");
    console.log("\n  ADMIN:");
    console.log("    Email: amar94cafe@gmail.com");
    console.log("    Password: Amar@94");
    console.log("\n  CHEF:");
    console.log("    Email: chef94cafe@gmail.com");
    console.log("    Password: Chef@94");
    console.log("\n  WAITER:");
    console.log("    Email: raj94cafe@gmail.com");
    console.log("    Password: Raj@94");
    const finalUsersCount = await User.countDocuments();
    const finalCategoriesCount = await Category.countDocuments();
    const finalMenuItemsCount = await MenuItem.countDocuments();
    const finalTablesCount = await Table.countDocuments();
    const finalQRCodesCount = await QRCode.countDocuments();

    console.log("\n📊 System Setup:");
    console.log(`  - Users: ${finalUsersCount}`);
    console.log(`  - Categories: ${finalCategoriesCount}`);
    console.log(`  - Menu Items: ${finalMenuItemsCount}`);
    console.log(`  - Tables: ${finalTablesCount}`);
    console.log(`  - QR Codes: ${finalQRCodesCount}`);
    console.log("\n🚀 System is ready for production!");
    console.log("=".repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}
