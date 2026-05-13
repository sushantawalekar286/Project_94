const mongoose = require("mongoose");

/**
 * PHASE 3 — Fixed QRCode model
 * 
 * Added missing fields: scannerId, qrId, qrValue.
 * These are required for admin panel display and scanning verification.
 * Added unique constraint on table (one QR per table).
 */
const qrCodeSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      unique: true,       // One QR per table
      index: true
    },
    token: { type: String, required: true },
    qrDataUrl: { type: String, required: true },  // base64 PNG for display/print
    scannerId: { type: String, default: "" },      // e.g. SCANNER-T3
    qrId: { type: String, default: "" },           // e.g. QR-<objectId>
    qrValue: { type: String, default: "" }         // full URL encoded in QR
  },
  { timestamps: true }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);
