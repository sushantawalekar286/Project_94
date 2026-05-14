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

const buildQRValue = (table, clientUrl) => {
  const scannerId = `SCANNER-T${table.number}`;
  const qrId = `QR-${table._id}`;
  const baseUrl = clientUrl.replace(/\/$/, "");
  // Canonical production URL for customer table entrypoint
  return `${baseUrl}/table/${table.number}?scannerId=${encodeURIComponent(scannerId)}&qrId=${encodeURIComponent(qrId)}&token=${encodeURIComponent(table.token)}`;
};

const generateForTable = async (table, clientUrl) => {
  if (!clientUrl) {
    throw new Error("CLIENT_URL environment variable is not set. Cannot generate QR codes.");
  }

  const qrValue = buildQRValue(table, clientUrl);
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

  // Sync qrCodeUrl and identifiers back to the Table document
  table.qrCodeUrl = qrDataUrl;
  table.scannerId = scannerId;
  table.qrId = qrId;
  table.tableNumber = table.number;
  await table.save();

  return { record, qrDataUrl, qrValue, table };
};

const generateForAllTables = async (clientUrl) => {
  if (!clientUrl) {
    throw new Error("CLIENT_URL environment variable is not set. Cannot generate QR codes.");
  }
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
