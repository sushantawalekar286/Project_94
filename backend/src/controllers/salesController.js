const { dailySales, monthlySales, todayStats, topMenuItems, revenueTimeline, getSalesReport } = require("../services/salesService");

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

const Sale = require("../models/Sale");
const Order = require("../models/Order");
const Table = require("../models/Table");

const getDashboardStats = async (req, res, next) => {
  try {
    const [today, topItems, timeline] = await Promise.all([
      todayStats(),
      topMenuItems(5),
      revenueTimeline(7)
    ]);

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyRevenueResult = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    const totalOrders = await Order.countDocuments();
    const activeTables = await Table.countDocuments({ status: "occupied" });

    res.json({ 
      today, 
      topItems, 
      lowStockCount: 0, 
      timeline,
      monthlyRevenue,
      totalOrders,
      activeTables
    });
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

const getSalesReportData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required query parameters" });
    }
    const report = await getSalesReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDailySales, getMonthlySales, getDashboardStats, getTopItems, getRevenueTimeline, getSalesReportData };
