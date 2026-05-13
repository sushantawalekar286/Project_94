const Category = require("../models/Category");

const listCategories = async (req, res, next) => {
  try {
    res.json(await Category.find());
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    res.status(201).json(await Category.create(req.body));
  } catch (error) {
    next(error);
  }
};

module.exports = { listCategories, createCategory };
