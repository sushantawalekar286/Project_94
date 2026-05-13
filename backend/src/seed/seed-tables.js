const mongoose = require("mongoose");
const crypto = require("crypto");
const Table = require("../models/Table");
const { generateForTable } = require("../services/qrService");
require("dotenv").config({ path: "../../.env" });

const seedTables = async () => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  for (let i = 1; i <= 10; i++) {
    const existing = await Table.findOne({ number: i });
    const token = existing?.token || crypto.randomBytes(8).toString("hex");
    const table = await Table.findOneAndUpdate(
      { number: i },
      { number: i, token, isActive: true },
      { upsert: true, new: true }
    );
    // Generate QR automatically (this creates the QRCode model record and links the URL)
    await generateForTable(table, clientUrl);
  }
  console.log("✅ 10 Tables & QR Codes seeded successfully.");
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => seedTables())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = seedTables;
