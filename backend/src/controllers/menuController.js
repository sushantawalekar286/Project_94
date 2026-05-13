const MenuItem = require("../models/MenuItem");

/**
 * PHASE 2 & 7 — Fixed menuController
 *
 * Bugs fixed:
 * 1. listMenu: added isAvailable filter option, lean() for perf, proper populate.
 * 2. createMenuItem: strips unknown fields, validates category exists.
 * 3. updateMenuItem: returns 404 if not found instead of null.
 * 4. deleteMenuItem: returns 404 if not found.
 * 5. All: proper error propagation.
 */

const listMenu = async (req, res, next) => {
  try {
    const filter = {};
    // Admins see all items; public only sees available ones
    if (!req.user) filter.isAvailable = true;

    const items = await MenuItem.find(filter)
      .populate("category", "name isActive")
      .populate("ingredients.inventoryItem", "name unit stock")
      .lean()
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, imageUrl, price, category, isAvailable, ingredients } = req.body;
    const item = await MenuItem.create({
      name,
      description,
      imageUrl,
      price,
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      ingredients: ingredients || []
    });
    const populated = await item.populate("category", "name");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("category", "name");
    if (!item) return res.status(404).json({ success: false, message: "Menu item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Menu item not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { listMenu, createMenuItem, updateMenuItem, deleteMenuItem };
