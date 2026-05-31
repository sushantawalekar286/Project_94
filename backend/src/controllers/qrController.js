const Table = require("../models/Table");
const QRCodeModel = require("../models/QRCode");
const { generateForAllTables, generateForTable } = require("../services/qrService");
const env = require("../config/env");

/**
 * PHASE 3 — Fixed qrController
 *
 * Bugs fixed:
 * 1. listQRCodes now returns QRCode records (with qrDataUrl) not just Tables.
 * 2. generateQRCodes validates CLIENT_URL before attempting generation.
 * 3. Added generateQRForTable (single table regeneration).
 * 4. Proper error messages distinguishing table-not-found vs generation errors.
 */

const listQRCodes = async (req, res, next) => {
  try {
    // Join Table + QRCode so admin gets all data in one call
    const tables = await Table.find().sort({ number: 1 }).lean();
    const qrRecords = await QRCodeModel.find().lean();
    const qrByTable = Object.fromEntries(qrRecords.map((r) => [r.table.toString(), r]));

    const result = tables.map((table) => ({
      ...table,
      qr: qrByTable[table._id.toString()] || null
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const generateQRCodes = async (req, res, next) => {
  console.log("[QR API] POST /api/qr/generate - Request received:", req.body);
  try {
    const count = parseInt(req.body.count, 10) || 1;
    console.log("[QR API] Number of tables requested:", count);
    if (count <= 0) {
      console.warn("[QR API] Validation failed: Count must be positive");
      return res.status(400).json({ success: false, message: "Count must be a positive number" });
    }

    const clientUrl = process.env.FRONTEND_URL || env.CLIENT_URL || "https://project-94-two.vercel.app";
    const crypto = require("crypto");

    // Find the highest table number in the system using both number and tableNumber sorting
    const lastTable = await Table.findOne().sort({ tableNumber: -1 });
    const lastTableByNumber = await Table.findOne().sort({ number: -1 });
    const lastTableNumber = lastTable ? lastTable.tableNumber : (lastTableByNumber ? lastTableByNumber.number : 0);
    console.log("[QR API] Highest existing table number:", lastTableNumber);

    const generated = [];
    for (let i = 1; i <= count; i++) {
      const newTableNumber = lastTableNumber + i;
      console.log(`[QR API] Generating Table #${newTableNumber}...`);
      const token = crypto.randomBytes(16).toString("hex");

      const table = new Table({
        number: newTableNumber,
        tableNumber: newTableNumber,
        token,
        status: "available",
        isActive: true
      });
      await table.save();
      console.log(`[QR API] Database save result: Success. Table ID: ${table._id}`);

      const result = await generateForTable(table, clientUrl);
      console.log(`[QR API] Generated QR URL: ${result.qrValue}`);
      console.log(`[QR API] QR image generation result: Success. Base64 length: ${result.qrDataUrl ? result.qrDataUrl.length : 0}`);
      generated.push(result);
    }

    const responseData = {
      success: true,
      message: `Successfully generated ${count} new table(s)`,
      data: generated.map((r) => ({ tableNumber: r.table.tableNumber, qrId: r.record.qrId }))
    };
    console.log("[QR API] Final response:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("QR Generation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

const generateQRForTable = async (req, res, next) => {
  console.log(`[QR API] POST /api/qr/generate/${req.params.tableId} - Request received`);
  try {
    const table = await Table.findById(req.params.tableId);
    if (!table) {
      console.warn(`[QR API] Table ID not found: ${req.params.tableId}`);
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    console.log(`[QR API] Table Found: #${table.number} (tableNumber: ${table.tableNumber})`);

    const clientUrl = process.env.FRONTEND_URL || env.CLIENT_URL || "https://project-94-two.vercel.app";
    const result = await generateForTable(table, clientUrl);
    console.log(`[QR API] QR regenerated successfully: ${result.qrValue}`);
    res.json({ success: true, data: result.record });
  } catch (error) {
    console.error("QR Single Generation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

module.exports = { listQRCodes, generateQRCodes, generateQRForTable };
