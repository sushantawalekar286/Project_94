const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      "any.required": "Please enter your email.",
      "string.empty": "Please enter your email.",
      "string.email": "Please enter a valid email address."
    }),
  password: Joi.string()
    .trim()
    .required()
    .messages({
      "any.required": "Please enter your password.",
      "string.empty": "Please enter your password."
    })
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "chef", "waiter").default("chef")
});

module.exports = { loginSchema, registerSchema };
