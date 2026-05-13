const Sale = require("../models/Sale");
const Order = require("../models/Order");

/**
 * PHASE 8 — Enhanced salesService
 *
 * Bug fixed:
 * - dailySales/monthlySales used "$soldAt" but Sale schema uses "createdAt".
 *   This caused $dateToString to return null for all records.
 *
 * Added:
 * - todayStats() — for admin dashboard realtime widget
 * - topMenuItems() — most popular items across all orders
 * - revenueTimeline() — last N days for chart data
 */

const dailySales = async () => {
  return Sale.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const monthlySales = async () => {
  return Sale.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * Today's stats for admin dashboard widget.
 */
const todayStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [salesResult, orderResult] = await Promise.all([
    Sale.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]),
    Order.countDocuments({ status: "Pending" })
  ]);

  return {
    todayRevenue: salesResult[0]?.total || 0,
    todayOrders: salesResult[0]?.count || 0,
    pendingOrders: orderResult
  };
};

/**
 * Top selling menu items for admin dashboard.
 */
const topMenuItems = async (limit = 5) => {
  return Order.aggregate([
    { $match: { status: { $in: ["Completed", "Served"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        totalQty: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { totalQty: -1 } },
    { $limit: limit }
  ]);
};

/**
 * Revenue per day for last N days — for chart widget.
 */
const revenueTimeline = async (days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  return Sale.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = { dailySales, monthlySales, todayStats, topMenuItems, revenueTimeline };
