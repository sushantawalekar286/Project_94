const mongoose = require("mongoose");
const crypto = require("crypto");

const tableSchema = new mongoose.Schema(
  {
    // Table identification
    number: { 
      type: Number, 
      required: true, 
      unique: true,
      min: 1,
      max: 100
    },
    // Unique token for QR scanning
    token: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex")
    },
    // QR Code reference
    qrCode: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "QRCode",
      default: null
    },
    // Table status tracking
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "cleaning"],
      default: "available"
    },
    // Current occupancy
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
    // Active order reference
    activeOrder: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order",
      default: null
    },
    // Session tracking for customer isolation
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
    // Is this table active/enabled?
    isActive: { 
      type: Boolean, 
      default: true 
    },
    // QR scanner info
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

// Index for quick lookups
tableSchema.index({ number: 1 });
tableSchema.index({ token: 1 });
tableSchema.index({ status: 1 });
tableSchema.index({ activeOrder: 1 });

module.exports = mongoose.model("Table", tableSchema);
