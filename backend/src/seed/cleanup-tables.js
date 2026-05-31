require("../utils/dnsHelper");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const Table = require("../models/Table");
const QRCode = require("../models/QRCode");

const cleanup = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required to run the cleanup.");
  }
  
  console.log("Starting table database cleanup...");
  
  // Delete all table and QRCode records
  const tableResult = await Table.deleteMany({});
  const qrResult = await QRCode.deleteMany({});
  
  console.log(`Deleted ${tableResult.deletedCount} records from Table collection.`);
  console.log(`Deleted ${qrResult.deletedCount} records from QRCode collection.`);
  console.log("✅ Tables and QR codes database cleanup complete.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => cleanup())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = cleanup;
