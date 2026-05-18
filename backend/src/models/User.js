const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true, 
      select: false 
    },
    role: { 
      type: String, 
      enum: ["admin", "chef", "waiter"], 
      default: "waiter" 
    },
    refreshTokenHash: { 
      type: String, 
      select: false
    },
    phone: { 
      type: String, 
      default: "" 
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    },
    lastLogin: { 
      type: Date, 
      default: null 
    },
    resetToken: { 
      type: String, 
      select: false,
      default: null 
    },
    resetTokenExpiry: { 
      type: Date, 
      select: false,
      default: null 
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model("User", userSchema);
