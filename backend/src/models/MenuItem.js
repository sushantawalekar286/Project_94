const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      default: "" 
    },
    image: {
      type: String,
      default: ""
    },
    imageUrl: { 
      type: String, 
      default: "" 
    },
    pricingType: {
      type: String,
      enum: ["single", "half-full"],
      default: "single"
    },
    singlePrice: {
      type: Number,
      min: 0,
      default: null
    },
    halfPrice: {
      type: Number,
      min: 0,
      default: null
    },
    fullPrice: {
      type: Number,
      min: 0,
      default: null
    },
    price: { 
      type: Number, 
      min: 0,
      default: null 
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    available: {
      type: Boolean,
      default: true
    },
    isAvailable: { 
      type: Boolean, 
      default: true 
    },
    preparationTime: { 
      type: Number, 
      default: 15, 
      min: 1 
    },
    spiceLevel: { 
      type: Number, 
      enum: [0, 1, 2, 3, 4, 5], 
      default: 1 
    },
    vegetarian: { 
      type: Boolean, 
      default: false 
    },
    vegan: { 
      type: Boolean, 
      default: false 
    },
    allergens: [
      { type: String }
    ]
  },
  { timestamps: true }
);

menuItemSchema.pre("validate", function syncMenuPricing(next) {
  const imageValue = this.image || this.imageUrl || "";
  this.image = imageValue;
  this.imageUrl = imageValue;

  const availableValue = typeof this.available === "boolean" ? this.available : this.isAvailable;
  this.available = availableValue;
  this.isAvailable = availableValue;

  if (this.pricingType === "half-full") {
    if (this.fullPrice == null && this.price != null) this.fullPrice = this.price;
    if (this.singlePrice == null && this.fullPrice != null) this.singlePrice = this.fullPrice;
    this.price = this.fullPrice ?? this.singlePrice ?? this.price;
  } else {
    if (this.singlePrice == null && this.price != null) this.singlePrice = this.price;
    if (this.fullPrice == null && this.singlePrice != null) this.fullPrice = this.singlePrice;
    this.price = this.singlePrice ?? this.price;
    this.halfPrice = null;
  }

  next();
});

menuItemSchema.index({ isAvailable: 1, category: 1 });
menuItemSchema.index({ vegetarian: 1, vegan: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);
