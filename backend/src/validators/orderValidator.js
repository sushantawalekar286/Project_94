const Joi = require("joi");
const { ORDER_STATUS } = require("../constants/orderStatus");

const orderSchema = Joi.object({
  tableId: Joi.string().optional(),
  tableNumber: Joi.number().integer().min(1).optional(),
  token: Joi.string().allow("").optional(),
  items: Joi.array()
    .items(
      Joi.object({
        menuItem: Joi.string().required(),
        quantity: Joi.number().integer().min(1).max(99).required()
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
