const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true },
    tableNumber: { type: Number },
    token: { type: String, required: true, unique: true },
    scannerId: { type: String },
    qrId: { type: String },
    qrCodeUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Auto-sync tableNumber and number if needed
tableSchema.pre("save", function(next) {
  if (this.isModified("number") && !this.tableNumber) {
    this.tableNumber = this.number;
  }
  next();
});

module.exports = mongoose.model("Table", tableSchema);
