const Joi = require("joi");

const inventorySchema = Joi.object({
  name: Joi.string().required(),
  unit: Joi.string().required(),
  stock: Joi.number().min(0).required(),
  lowStockThreshold: Joi.number().min(0).default(10)
});

module.exports = { inventorySchema };
