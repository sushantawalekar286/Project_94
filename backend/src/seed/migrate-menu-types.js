require("../utils/dnsHelper");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Category = require("../models/Category");

const CHINESE_KEYWORDS = ["momo", "soup", "chopsuey", "noodle", "rice", "chicken"];
const CHINESE_EXACT_NAMES = [
  "Momos", "Paneer Course (Rice)", "Paneer Course (Noodles)", 
  "Chicken Special", "Veg Soups", "Veg Chopsuey", "Non-Veg Soups", 
  "Non-Veg Chopsuey", "Non-Veg Course (Rice)", "Non-Veg Course (Noodles)"
];

const migrate = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }
  
  console.log(`Connecting to database...`);
  await mongoose.connect(uri);
  
  const categories = await Category.find({});
  console.log(`Found ${categories.length} categories to migrate.`);
  
  let cafeCount = 0;
  let chineseCount = 0;
  
  for (const cat of categories) {
    const name = cat.name || "";
    const nameLower = name.toLowerCase();
    
    let isChinese = CHINESE_EXACT_NAMES.some(
      exactName => exactName.toLowerCase() === nameLower
    ) || CHINESE_KEYWORDS.some(
      keyword => nameLower.includes(keyword)
    );
    
    const targetType = isChinese ? "chinese" : "cafe";
    
    cat.menuType = targetType;
    await cat.save();
    
    console.log(`- Category "${name}" migrated to menuType: "${targetType}"`);
    if (isChinese) {
      chineseCount++;
    } else {
      cafeCount++;
    }
  }
  
  console.log("\nMigration Summary:");
  console.log(`- Migrated to Cafe: ${cafeCount}`);
  console.log(`- Migrated to Chinese: ${chineseCount}`);
  console.log("- Total: ", cafeCount + chineseCount);
  
  await mongoose.disconnect();
  console.log("Database connection closed.");
};

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
