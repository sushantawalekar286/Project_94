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

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
