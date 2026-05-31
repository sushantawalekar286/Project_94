require("../utils/dnsHelper");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const Table = require("../models/Table");
const { generateForTable } = require("../services/qrService");

const migrateTables = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required to run the migration.");
  }
  const clientUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "https://project-94-two.vercel.app";
  console.log("Migrating tables using domain/URL:", clientUrl);

  const tables = await Table.find({});
  console.log(`Found ${tables.length} tables in the database.`);

  let migratedCount = 0;
  for (const table of tables) {
    let changed = false;

    // Ensure tableNumber is set
    if (table.tableNumber === undefined || table.tableNumber === null) {
      table.tableNumber = table.number;
      changed = true;
    }

    const expectedUrl = `https://project-94-two.vercel.app/table/${table.tableNumber || table.number}`;

    // Force migration if url is missing, contains localhost, or doesn't match the production Vercel format
    if (!table.qrCodeUrl || !table.qrImage || table.qrCodeUrl !== expectedUrl || table.qrCodeUrl.includes("localhost") || table.qrCodeUrl.includes("127.0.0.1")) {
      console.log(`Updating/Regenerating QR for Table ${table.number} to production domain...`);
      await generateForTable(table, clientUrl);
      migratedCount++;
    } else if (changed) {
      await table.save();
      migratedCount++;
    }
  }

  console.log(`✅ Table migration complete. Updated/migrated ${migratedCount} tables.`);
};

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digital_waiter")
    .then(() => migrateTables())
    .then(() => mongoose.disconnect())
    .catch(console.error);
}

module.exports = migrateTables;
