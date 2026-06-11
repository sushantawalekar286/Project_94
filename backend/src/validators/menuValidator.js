const Joi = require("joi");

const menuSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  imageUrl: Joi.string().allow(""),
  image: Joi.string().allow(""),
  pricingType: Joi.string().valid("single", "half-full").default("single"),
  price: Joi.number().min(0).allow(null),
  singlePrice: Joi.number().min(0).allow(null),
  halfPrice: Joi.number().min(0).allow(null),
  fullPrice: Joi.number().min(0).allow(null),
  category: Joi.string().required(),
  available: Joi.boolean().default(true),
  isAvailable: Joi.boolean().default(true),
  dietaryType: Joi.string().valid("veg", "non-veg", "egg").default("veg"),
  vegetarian: Joi.boolean().default(false)
}).custom((value, helpers) => {
  if (value.pricingType === "single" && value.singlePrice == null && value.price == null) {
    return helpers.error("any.custom", { message: "singlePrice is required for single pricing" });
  }
  if (value.pricingType === "half-full" && (value.halfPrice == null || value.fullPrice == null)) {
    return helpers.error("any.custom", { message: "halfPrice and fullPrice are required for half-full pricing" });
  }
  return value;
});

module.exports = { menuSchema };
