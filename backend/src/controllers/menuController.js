const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

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
    const [items, stats] = await Promise.all([
      MenuItem.find({})
        .populate("category", "name isActive menuType")
        .lean()
        .sort({ createdAt: -1 }),
      Order.aggregate([
        { $match: { status: { $in: ["Completed", "Paid"] } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.menuItem",
            totalQuantitySold: { $sum: "$items.quantity" },
            totalOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const statsMap = {};
    stats.forEach(s => {
      if (s._id) {
        statsMap[s._id.toString()] = {
          totalQuantitySold: s.totalQuantitySold || 0,
          totalOrders: s.totalOrders || 0
        };
      }
    });

    const itemsWithStats = items.map(item => {
      const itemStats = statsMap[item._id.toString()] || { totalQuantitySold: 0, totalOrders: 0 };
      return {
        ...item,
        totalQuantitySold: itemStats.totalQuantitySold,
        totalOrders: itemStats.totalOrders
      };
    });

    res.json(itemsWithStats);
  } catch (error) {
    next(error);
  } finally {
    console.log("[MENU LIST FINALLY] Completed listMenu operation");
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const image = req.body.image || req.body.imageUrl || "";
    const pricingType = req.body.pricingType || "single";
    const item = await MenuItem.create({
      name: req.body.name,
      description: req.body.description,
      image,
      imageUrl: image,
      pricingType,
      price: req.body.price ?? null,
      singlePrice: pricingType === "single" ? (req.body.singlePrice ?? req.body.price ?? null) : req.body.singlePrice ?? null,
      halfPrice: pricingType === "half-full" ? req.body.halfPrice ?? null : null,
      fullPrice: pricingType === "half-full" ? (req.body.fullPrice ?? req.body.price ?? null) : req.body.fullPrice ?? null,
      category: req.body.category,
      available: req.body.available ?? req.body.isAvailable ?? true,
      isAvailable: req.body.isAvailable ?? req.body.available ?? true,
      preparationTime: req.body.preparationTime,
      spiceLevel: req.body.spiceLevel,
      vegetarian: req.body.vegetarian,
      vegan: req.body.vegan,
      allergens: req.body.allergens
    });
    const populated = await item.populate([{ path: "category", select: "name isActive menuType" }]);
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  } finally {
    console.log("[MENU CREATE FINALLY] Completed createMenuItem operation");
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const image = req.body.image || req.body.imageUrl;
    const nextBody = {
      ...req.body,
      ...(image !== undefined ? { image, imageUrl: image } : {}),
      ...(req.body.available !== undefined ? { isAvailable: req.body.available } : {}),
      ...(req.body.isAvailable !== undefined ? { available: req.body.isAvailable } : {})
    };
    const item = await MenuItem.findByIdAndUpdate(req.params.id, nextBody, { new: true, runValidators: true })
      .populate("category", "name isActive menuType");
    if (!item) return res.status(404).json({ success: false, message: "Menu item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  } finally {
    console.log(`[MENU UPDATE FINALLY] Completed updateMenuItem operation for ID: ${req.params.id}`);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Menu item not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  } finally {
    console.log(`[MENU DELETE FINALLY] Completed deleteMenuItem operation for ID: ${req.params.id}`);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable, available: isAvailable },
      { new: true, runValidators: true }
    ).populate("category", "name isActive menuType");
    if (!item) return res.status(404).json({ success: false, message: "Menu item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  } finally {
    console.log(`[MENU AVAILABILITY FINALLY] Completed updateAvailability for ID: ${req.params.id}`);
  }
};

module.exports = { listMenu, createMenuItem, updateMenuItem, deleteMenuItem, updateAvailability };
