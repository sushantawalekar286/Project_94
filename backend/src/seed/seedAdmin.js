require("../utils/dnsHelper");
const mongoose = require("mongoose");
const seedAdmin = require("./seed-admin");
require("dotenv").config();

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital-waiter";
    await mongoose.connect(uri);
    await seedAdmin();
  } catch (error) {
    console.error("Error in seedAdmin:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();

