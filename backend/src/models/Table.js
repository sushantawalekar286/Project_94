const mongoose = require("mongoose");
const crypto = require("crypto");

const tableSchema = new mongoose.Schema(
  {
    number: { 
      type: Number, 
      required: true, 
      unique: true,
      min: 1,
      max: 100
    },
    tableNumber: {
      type: Number,
      required: true,
      unique: true
    },
    qrCodeUrl: {
      type: String,
      default: ""
    },
    qrUrl: {
      type: String,
      default: ""
    },
    qrImage: {
      type: String,
      default: ""
    },
    token: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex")
    },
    qrCode: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "QRCode",
      default: null
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "cleaning"],
      default: "available"
    },
    occupancy: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    maxCapacity: { 
      type: Number, 
      default: 4, 
      min: 1 
    },
    activeOrder: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order",
      default: null
    },
    sessionToken: { 
      type: String, 
      default: null 
    },
    sessionStartedAt: { 
      type: Date, 
      default: null 
    },
    sessionExpiredAt: { 
      type: Date, 
      default: null 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    scannerId: { 
      type: String, 
      default: "" 
    },
    qrId: { 
      type: String, 
      default: "" 
    }
  },
  { timestamps: true }
);

tableSchema.index({ status: 1 });
tableSchema.index({ activeOrder: 1 });

module.exports = mongoose.model("Table", tableSchema);
