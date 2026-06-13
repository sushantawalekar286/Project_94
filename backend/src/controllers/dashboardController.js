const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");

const getTodayDashboardStats = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Today's Revenue (paid orders total amount created today)
    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]);
    const revenue = revenueResult[0]?.total || 0;

    // 2. Today's Orders (total orders placed today, not Cancelled)
    const ordersResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: { $ne: "Cancelled" }
        }
      },
      { $count: "count" }
    ]);
    const orders = ordersResult[0]?.count || 0;

    // 3. Pending Orders (orders not fully served: Pending, Accepted, Cooking, Preparing, Ready)
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["Pending", "Accepted", "Cooking", "Preparing", "Ready"] }
    });

    // 4. Completed Orders (orders fully served today, status is Served, Completed, or Paid and created today)
    const completedResult = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Served", "Completed", "Paid"] },
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      { $count: "count" }
    ]);
    const completedOrders = completedResult[0]?.count || 0;

    // 5. Active Tables (tables currently occupied)
    const activeTables = await Table.countDocuments({ status: "occupied" });

    // 6. Cancelled Orders Today (orders cancelled today)
    const cancelledResult = await Order.aggregate([
      {
        $match: {
          status: "Cancelled",
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      { $count: "count" }
    ]);
    const cancelledOrdersToday = cancelledResult[0]?.count || 0;

    // 7. Top Selling Items Today (paid orders created today)
    const topItemsResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          quantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { quantity: -1 } }
    ]);
    const topItems = topItemsResult.map(item => ({
      name: item._id,
      quantity: item.quantity
    }));

    // 8. Category Revenue Today (paid orders created today)
    const categorySalesResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
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
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const categorySales = categorySalesResult.map(cat => ({
      category: cat._id,
      revenue: cat.revenue
    }));

    res.json({
      success: true,
      data: {
        revenue,
        orders,
        pendingOrders,
        completedOrders,
        activeTables,
        cancelledOrdersToday,
        topItems,
        categorySales
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayDashboardStats
};
