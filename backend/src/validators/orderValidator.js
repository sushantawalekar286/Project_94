const Joi = require("joi");
const { ORDER_STATUS } = require("../constants/orderStatus");

const orderSchema = Joi.object({
  tableId: Joi.string().allow(null).optional(),
  tableNumber: Joi.number().integer().min(1).allow(null).optional(),
  token: Joi.string().allow("", null).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        menuItem: Joi.string().required(),
        quantity: Joi.number().integer().min(1).max(99).required(),
        portionType: Joi.string().valid("single", "half", "full").optional()
      })
    )
    .min(1)
    .max(50)
    .required()
}).or("tableId", "tableNumber");

// PHASE 5 — Validate that status value is a known enum
const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .required()
});

module.exports = { orderSchema, statusSchema };
