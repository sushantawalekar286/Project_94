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
  try {
    const clientUrl = env.CLIENT_URL;
    if (!clientUrl) {
      return res.status(500).json({
        success: false,
        message: "CLIENT_URL is not configured in environment variables."
      });
    }
    const result = await generateForAllTables(clientUrl);
    res.json({
      success: true,
      message: `QR codes generated for ${result.length} table(s)`,
      data: result.map((r) => ({ tableNumber: r.table.number, qrId: r.record.qrId }))
    });
  } catch (error) {
    next(error);
  }
};

const generateQRForTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.tableId);
    if (!table) return res.status(404).json({ success: false, message: "Table not found" });

    console.log("Table Found:", table._id.toString(), table.number);

    const clientUrl = env.CLIENT_URL;
    if (!clientUrl) {
      return res.status(500).json({ success: false, message: "CLIENT_URL is not configured." });
    }

    const result = await generateForTable(table, clientUrl);
    res.json({ success: true, data: result.record });
  } catch (error) {
    next(error);
  }
};

module.exports = { listQRCodes, generateQRCodes, generateQRForTable };
