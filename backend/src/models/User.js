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
    // Persist refresh token hash for rotation/invalidation
    refreshTokenHash: { 
      type: String, 
      select: false 
    },
    // Additional user info
    phone: { 
      type: String, 
      default: "" 
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    },
    // Last login tracking
    lastLogin: { 
      type: Date, 
      default: null 
    },
    // Password reset token for forgot password feature
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

// Index for common queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model("User", userSchema);
