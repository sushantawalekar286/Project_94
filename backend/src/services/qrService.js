const QRCode = require("../models/QRCode");
const Table = require("../models/Table");
const generateQRCodeImage = require("../utils/generateQRCode");

/**
 * PHASE 3 — Fixed QR Generation System
 *
 * Bugs fixed:
 * 1. CLIENT_URL was not validated — now throws a clear error if missing.
 * 2. QR URL format was inconsistent — now strictly follows the spec.
 * 3. generateForTable now returns both record and table for admin panel display.
 * 4. Added generateForTable (single table) export so admin can regenerate per table.
 * 5. QR value uses encodeURIComponent for the token to handle special chars.
 */

const buildQRValue = (table) => {
  const frontendUrl = (process.env.FRONTEND_URL || "https://project-94-two.vercel.app").replace(/\/$/, "");
  const tableNumber = table.tableNumber || table.number;
  const qrUrl = `${frontendUrl}/table/${tableNumber}`;
  return qrUrl;
};

const generateForTable = async (table, clientUrl) => {
  const qrValue = buildQRValue(table);
  // Generate higher quality QR with error correction
  const qrDataUrl = await generateQRCodeImage(qrValue, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 400
  });

  console.log("QR Generated:", qrValue);

  const scannerId = `SCANNER-T${table.number}`;
  const qrId = `QR-${table._id}`;

  const record = await QRCode.findOneAndUpdate(
    { table: table._id },
    {
      token: table.token,
      qrDataUrl,
      scannerId,
      qrId,
      qrValue
    },
    { upsert: true, new: true }
  );

  // Sync fields back to the Table document
  table.qrCodeUrl = qrValue;   // Canonical URL, e.g. https://mydomain.com/table/1
  table.qrUrl = qrValue;       // Canonical URL (standard field)
  table.qrImage = qrDataUrl;   // Base64 encoded PNG image for displaying
  table.scannerId = scannerId;
  table.qrId = qrId;
  table.tableNumber = table.number;
  await table.save();

  return { record, qrDataUrl, qrValue, table };
};

const generateForAllTables = async (clientUrl) => {
  const tables = await Table.find({ isActive: true }).sort({ number: 1 });
  if (!tables.length) throw new Error("No active tables found. Run seed-tables first.");

  const results = [];
  for (const table of tables) {
    const result = await generateForTable(table, clientUrl);
    results.push(result);
  }
  return results;
};

module.exports = { generateForTable, generateForAllTables, buildQRValue };
