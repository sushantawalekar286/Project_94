require("dotenv").config({ path: "backend/.env" });
const mongoose = require("mongoose");
const connectDB = require("../../backend/src/config/db");
const MenuItem = require("../../backend/src/models/MenuItem");
const { menuSchema } = require("../../backend/src/validators/menuValidator");

async function runTest() {
  await connectDB(process.env.MONGODB_URI);

  const item = await MenuItem.findOne({});
  if (!item) {
    console.log("No menu items found to test");
    process.exit(0);
  }

  console.log("Testing with menu item:", item.name, "ID:", item._id);

  // Test 1: Validate payload using Joi validator
  const testPayload = {
    name: item.name,
    description: item.description,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80",
    pricingType: item.pricingType,
    singlePrice: item.singlePrice,
    halfPrice: item.halfPrice,
    fullPrice: item.fullPrice,
    price: item.price,
    category: item.category.toString(),
    available: item.available,
    isAvailable: item.isAvailable
  };

  console.log("Joi validation test...");
  const { error, value } = menuSchema.validate(testPayload);
  if (error) {
    console.error("❌ Joi validation failed:", error.message);
  } else {
    console.log("✅ Joi validation succeeded");
  }

  // Test 2: Perform update using MenuItem.findByIdAndUpdate
  console.log("Mongoose findByIdAndUpdate test...");
  try {
    const updated = await MenuItem.findByIdAndUpdate(
      item._id,
      { imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80" },
      { new: true, runValidators: true }
    );
    console.log("✅ Mongoose update succeeded. Updated imageUrl:", updated.imageUrl);
  } catch (err) {
    console.error("❌ Mongoose update failed:", err.message);
  }

  await mongoose.connection.close();
}

runTest();
