const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    menuType: {
      type: String,
      enum: ["cafe", "chinese"],
      default: "cafe",
      required: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
