const mongoose = require("mongoose");
const crypto = require("crypto");
const dotenv = require("dotenv");
const Table = require("../models/Table");
const QRCode = require("../models/QRCode");
const { generateForTable } = require("../services/qrService");

dotenv.config();

const TABLE_COUNT = Number(process.env.TABLE_COUNT || 10);

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }
  if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL is required");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await QRCode.deleteMany({}, { session });
      await Table.deleteMany({}, { session });

      const freshTables = Array.from({ length: TABLE_COUNT }, (_, index) => ({
        number: index + 1,
        token: crypto.randomBytes(8).toString("hex"),
        isActive: true
      }));

      await Table.insertMany(freshTables, { session });
    });

    const tables = await Table.find({ isActive: true }).sort({ number: 1 });
    for (const table of tables) {
      await generateForTable(table, process.env.CLIENT_URL);
    }

    console.log(`✅ Reset complete: recreated ${TABLE_COUNT} tables and QR codes.`);
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Reset tables failed:", error);
  process.exit(1);
});
