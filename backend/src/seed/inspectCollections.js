require("../utils/dnsHelper");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const inspectDb = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital-waiter";
  console.log(`Connecting to ${uri.replace(/:([^:@]+)@/, ":***@")}...`);
  
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  console.log("\n📋 Database Collections and Document Counts:");
  console.log("==============================================");
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`- ${col.name}: ${count} documents`);
  }
  console.log("==============================================\n");
  
  await mongoose.disconnect();
};

inspectDb().catch(console.error);
