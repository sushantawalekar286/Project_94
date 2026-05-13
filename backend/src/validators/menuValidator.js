const Joi = require("joi");

const menuSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  imageUrl: Joi.string().allow(""),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(),
  isAvailable: Joi.boolean().default(true)
});

module.exports = { menuSchema };
