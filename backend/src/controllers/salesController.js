const { dailySales, monthlySales, todayStats, topMenuItems, revenueTimeline } = require("../services/salesService");
const { getLowStockItems } = require("../services/inventoryService");

/**
 * PHASE 8 — Enhanced salesController
 *
 * Added:
 * - getDashboardStats() — aggregated widget data for admin dashboard
 * - getTopItems() — popular items
 * - getRevenueTimeline() — chart data (last 7 days)
 */

const getDailySales = async (req, res, next) => {
  try {
    res.json(await dailySales());
  } catch (error) {
    next(error);
  }
};

const getMonthlySales = async (req, res, next) => {
  try {
    res.json(await monthlySales());
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [today, topItems, lowStock, timeline] = await Promise.all([
      todayStats(),
      topMenuItems(5),
      getLowStockItems(),
      revenueTimeline(7)
    ]);
    res.json({ today, topItems, lowStockCount: lowStock.length, timeline });
  } catch (error) {
    next(error);
  }
};

const getTopItems = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;
    res.json(await topMenuItems(limit));
  } catch (error) {
    next(error);
  }
};

const getRevenueTimeline = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 7;
    res.json(await revenueTimeline(Math.min(days, 90))); // cap at 90 days
  } catch (error) {
    next(error);
  }
};

module.exports = { getDailySales, getMonthlySales, getDashboardStats, getTopItems, getRevenueTimeline };
