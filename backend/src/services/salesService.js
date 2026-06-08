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
    { $match: { status: { $in: ["Completed", "Paid"] } } },
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

/**
 * Compile detailed reports from orders, menu items, categories, and payments.
 */
const getSalesReport = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const dateMatch = {
    createdAt: { $gte: start, $lte: end }
  };
  
  // Base relative ranges
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Run global metrics (today, week, month)
  const [globalStats] = await Order.aggregate([
    {
      $facet: {
        today: [
          { $match: { createdAt: { $gte: todayStart }, status: { $in: ["Completed", "Paid"] } } },
          { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
        ],
        week: [
          { $match: { createdAt: { $gte: weekStart }, status: { $in: ["Completed", "Paid"] } } },
          { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
        ],
        month: [
          { $match: { createdAt: { $gte: monthStart }, status: { $in: ["Completed", "Paid"] } } },
          { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  const totalRevenueToday = globalStats?.today?.[0]?.revenue || 0;
  const totalOrdersToday = globalStats?.today?.[0]?.count || 0;
  const totalRevenueThisWeek = globalStats?.week?.[0]?.revenue || 0;
  const totalOrdersThisWeek = globalStats?.week?.[0]?.count || 0;
  const totalRevenueThisMonth = globalStats?.month?.[0]?.revenue || 0;
  const totalOrdersThisMonth = globalStats?.month?.[0]?.count || 0;

  // 2. Filtered main summary cards
  const [filteredSummary] = await Order.aggregate([
    { $match: { ...dateMatch, status: { $nin: ["Cancelled"] } } },
    {
      $facet: {
        all: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              revenue: { $sum: { $cond: [{ $in: ["$status", ["Completed", "Paid"]] }, "$total", 0] } }
            }
          }
        ],
        paid: [
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        unpaid: [
          { $match: { paymentStatus: { $ne: "paid" } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  const totalOrders = filteredSummary?.all?.[0]?.totalOrders || 0;
  const totalRevenue = filteredSummary?.all?.[0]?.revenue || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalPaidOrders = filteredSummary?.paid?.[0]?.count || 0;
  const totalUnpaidOrders = filteredSummary?.unpaid?.[0]?.count || 0;

  // 3. Daily Revenue Breakdown
  const dailyBreakdown = await Order.aggregate([
    { $match: { ...dateMatch, status: { $in: ["Completed", "Paid"] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        ordersCount: { $sum: 1 },
        revenue: { $sum: "$total" },
        taxCollected: { $sum: "$tax" },
        discounts: { $sum: 0 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 4. Weekly Revenue Breakdown
  const weeklyBreakdown = await Order.aggregate([
    { $match: { ...dateMatch, status: { $in: ["Completed", "Paid"] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-W%V", date: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$total" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 5. Monthly Revenue Breakdown
  const monthlyBreakdown = await Order.aggregate([
    { $match: { ...dateMatch, status: { $in: ["Completed", "Paid"] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$total" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 6. Order Status breakdown
  const statusCounts = {
    Completed: 0,
    Paid: 0,
    Pending: 0,
    Cancelled: 0,
    Served: 0,
    Cooking: 0,
    Accepted: 0,
    Ready: 0
  };

  const orderStatusStats = await Order.aggregate([
    { $match: dateMatch },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  orderStatusStats.forEach(s => {
    if (s._id in statusCounts) {
      statusCounts[s._id] = s.count;
    }
  });

  // 7. Product Reports - Best Selling Items
  const bestSelling = await Order.aggregate([
    { $match: { ...dateMatch, status: { $in: ["Completed", "Paid"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        quantitySold: { $sum: "$items.quantity" },
        revenueGenerated: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 15 }
  ]);

  // Worst Selling Items
  const worstSelling = await Order.aggregate([
    { $match: { ...dateMatch, status: { $in: ["Completed", "Paid"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        quantitySold: { $sum: "$items.quantity" }
      }
    },
    { $sort: { quantitySold: 1 } },
    { $limit: 15 }
  ]);

  // Category Performance
  const categoryPerformance = await Order.aggregate([
    { $match: { ...dateMatch, status: { $in: ["Completed", "Paid"] } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "menuitems",
        localField: "items.menuItem",
        foreignField: "_id",
        as: "menuItemDetails"
      }
    },
    { $unwind: { path: "$menuItemDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "menuItemDetails.category",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$categoryDetails.name", "Uncategorized"] },
        ordersCount: { $sum: 1 },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  // 8. Payment Reports
  const paymentMethodsUsed = await Order.aggregate([
    { $match: { ...dateMatch, status: { $in: ["Completed", "Paid"] } } },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        amount: { $sum: "$total" }
      }
    }
  ]);

  // 9. Table Reports
  const tableReports = await Order.aggregate([
    { $match: { ...dateMatch, status: { $nin: ["Cancelled"] } } },
    {
      $group: {
        _id: "$tableNumber",
        totalOrders: { $sum: 1 },
        revenueGenerated: { $sum: { $cond: [{ $in: ["$status", ["Completed", "Paid"]] }, "$total", 0] } }
      }
    },
    {
      $project: {
        tableNumber: "$_id",
        totalOrders: 1,
        revenueGenerated: 1,
        averageBillValue: { $cond: [{ $gt: ["$totalOrders", 0] }, { $divide: ["$revenueGenerated", "$totalOrders"] }, 0] }
      }
    },
    { $sort: { revenueGenerated: -1 } }
  ]);

  return {
    summary: {
      totalRevenueToday,
      totalRevenueThisWeek,
      totalRevenueThisMonth,
      totalOrdersToday,
      totalOrdersThisWeek,
      totalOrdersThisMonth,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalPaidOrders,
      totalUnpaidOrders
    },
    revenue: {
      daily: dailyBreakdown,
      weekly: weeklyBreakdown,
      monthly: monthlyBreakdown
    },
    orders: {
      total: totalOrders,
      completed: statusCounts.Completed,
      paid: statusCounts.Paid,
      pending: statusCounts.Pending,
      cancelled: statusCounts.Cancelled,
      served: statusCounts.Served,
      cooking: statusCounts.Cooking,
      accepted: statusCounts.Accepted,
      ready: statusCounts.Ready
    },
    products: {
      bestSelling,
      worstSelling,
      categoryPerformance
    },
    payments: {
      methods: paymentMethodsUsed,
      paidCount: totalPaidOrders,
      unpaidCount: totalUnpaidOrders,
      totalCollection: totalRevenue
    },
    tables: tableReports
  };
};

module.exports = { dailySales, monthlySales, todayStats, topMenuItems, revenueTimeline, getSalesReport };
