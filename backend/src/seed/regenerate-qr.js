const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Table = require("../models/Table");
const { generateForTable } = require("../services/qrService");

dotenv.config();

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }
  if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL is required");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const tables = await Table.find({ isActive: true }).sort({ number: 1 });

  for (const table of tables) {
    await generateForTable(table, process.env.CLIENT_URL);
  }

  console.log(`✅ Regenerated QR codes for ${tables.length} tables.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("❌ QR regeneration failed:", error);
  process.exit(1);
});
