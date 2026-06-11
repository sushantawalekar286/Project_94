const validateMiddleware = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message)
    });
  }
  req[property] = value;
  next();
};

module.exports = validateMiddleware;
