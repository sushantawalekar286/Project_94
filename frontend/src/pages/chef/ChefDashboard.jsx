import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { 
  FaFire, FaSyncAlt, FaSignOutAlt, FaChartPie, FaHistory, 
  FaUtensils, FaCoins, FaInfoCircle, FaClipboardList, 
  FaTags, FaSearch, FaCreditCard, FaChartLine 
} from "react-icons/fa";
import { getOrders, updateOrderStatus } from "../../services/orderService";
import { getDashboardStats } from "../../services/salesService";
import { getMenu } from "../../services/menuService";
import OrderCard from "../../components/chef/OrderCard";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState({
    today: { todayRevenue: 0, todayOrders: 0, pendingOrders: 0 },
    topItems: [],
    timeline: [],
    monthlyRevenue: 0,
    totalOrders: 0,
    activeTables: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kds"); // "kds", "history", "analytics"
  const [searchQuery, setSearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState("All");
  const [kdsFilter, setKdsFilter] = useState("All");

  const socket = useSocket();
  const { logout } = useAuth();

  const refreshData = async () => {
    console.log("[LOADING STATE] ChefDashboard refresh start");
    setLoading(true);
    try {
      const [ordersRes, statsRes, menuRes] = await Promise.all([
        getOrders(),
        getDashboardStats().catch(err => {
          console.warn("Failed to load dashboard stats for Chef:", err.message);
          return { data: null };
        }),
        getMenu().catch(err => {
          console.warn("Failed to load menu list for Chef:", err.message);
          return { data: [] };
        })
      ]);

      const fetchedOrders = Array.isArray(ordersRes.data?.data) 
        ? ordersRes.data.data 
        : Array.isArray(ordersRes.data) 
        ? ordersRes.data 
        : [];
      
      setOrders(fetchedOrders);

      if (statsRes.data) {
        setStats(statsRes.data);
      }

      setMenuItems(menuRes.data || []);
    } catch (error) {
      console.error("[ChefDashboard] refresh error:", error);
      toast.error("Failed to refresh dashboard data");
    } finally {
      console.log("[LOADING STATE] ChefDashboard refresh finish");
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData().catch(() => setLoading(false));

    // Polling backup
    const timer = setInterval(() => {
      getOrders().then(res => {
        const fetchedOrders = Array.isArray(res.data?.data) 
          ? res.data.data 
          : Array.isArray(res.data) 
          ? res.data 
          : [];
        setOrders(fetchedOrders);
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join:chef");
    
    const handleNewOrder = (order) => {
      toast.success(`New order received! Table ${order.tableNumber}`);
      refreshData();
    };
    
    const handleOrderUpdate = () => {
      refreshData();
    };

    socket.on("order:new", handleNewOrder);
    socket.on("order:updated", handleOrderUpdate);
    
    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:updated", handleOrderUpdate);
    };
  }, [socket]);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Order marked ${status}`);
      await refreshData();
    } catch (error) {
      console.error("[ChefDashboard] updateOrderStatus error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // 1. Menu item category map: name -> categoryName
  const menuCategoryMap = useMemo(() => {
    const map = {};
    menuItems.forEach(item => {
      if (item.name && item.category?.name) {
        map[item.name] = item.category.name;
      }
    });
    return map;
  }, [menuItems]);

  // 2. Calculations using current order history list
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

  const calculatedMetrics = useMemo(() => {
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= startOfToday && o.status !== "Cancelled");
    const totalToday = todayOrders.length;
    const pending = orders.filter(o => o.status === "Pending").length;
    const completed = orders.filter(o => ["Completed", "Paid"].includes(o.status)).length;
    
    const revenueTodayVal = todayOrders
      .filter(o => ["Completed", "Paid"].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const revenueWeeklyVal = orders
      .filter(o => new Date(o.createdAt) >= startOfWeek && ["Completed", "Paid"].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const revenueMonthlyVal = orders
      .filter(o => new Date(o.createdAt) >= startOfMonth && ["Completed", "Paid"].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Active orders (non-cancelled, non-finished)
    const active = orders.filter(o => !["Completed", "Paid", "Cancelled"].includes(o.status));

    // Recent orders (last 8)
    const recent = orders.slice(0, 8);

    // Most Ordered Categories (completed/paid orders)
    const categoryCount = {};
    orders.forEach(order => {
      if (["Completed", "Paid"].includes(order.status)) {
        order.items?.forEach(item => {
          const categoryName = menuCategoryMap[item.name] || "Other";
          categoryCount[categoryName] = (categoryCount[categoryName] || 0) + item.quantity;
        });
      }
    });

    const categoriesSorted = Object.entries(categoryCount)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);

    // Payment Status Overview
    const paidList = orders.filter(o => o.paymentStatus === "paid" && o.status !== "Cancelled");
    const unpaidList = orders.filter(o => o.paymentStatus !== "paid" && o.status !== "Cancelled");
    const paidCountVal = paidList.length;
    const unpaidCountVal = unpaidList.length;
    const paidSumVal = paidList.reduce((sum, o) => sum + (o.total || 0), 0);
    const unpaidSumVal = unpaidList.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalToday,
      pending,
      completed,
      revenueToday: revenueTodayVal,
      revenueWeekly: revenueWeeklyVal,
      revenueMonthly: revenueMonthlyVal,
      activeOrders: active,
      recentOrders: recent,
      mostOrderedCategories: categoriesSorted,
      paymentStatus: {
        paidCount: paidCountVal,
        unpaidCount: unpaidCountVal,
        paidSum: paidSumVal,
        unpaidSum: unpaidSumVal
      }
    };
  }, [orders, menuCategoryMap]);

  // Filtering active orders for KDS tab
  const filteredActiveOrders = useMemo(() => {
    if (kdsFilter === "All") return calculatedMetrics.activeOrders;
    return calculatedMetrics.activeOrders.filter(o => o.status === kdsFilter);
  }, [calculatedMetrics.activeOrders, kdsFilter]);

  // Filtering all orders for History tab
  const filteredHistoryOrders = useMemo(() => {
    let result = orders;
    
    // Status Filter
    if (historyFilter !== "All") {
      result = result.filter(o => o.status === historyFilter);
    }
    
    // Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        String(o.tableNumber).includes(q) || 
        o._id.toLowerCase().includes(q) ||
        o.items?.some(item => item.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, historyFilter, searchQuery]);

  return (
    <section className="min-h-screen bg-[#FAF9F6] text-neutral-800 font-sans antialiased">
      {/* Upper Brand Header */}
      <header className="bg-white border-b border-neutral-200/60 px-4 py-4 sm:px-8 shadow-sm flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <img src="/logo.png" alt="94 Cafe & Chinese Logo" className="h-14 w-14 rounded-2xl object-cover shadow-sm border border-neutral-150 bg-white" />
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-red-600 font-black">
              <FaFire className="animate-pulse" /> Kitchen Management Panel
            </div>
            <h1 className="mt-0.5 text-xl font-black text-neutral-800 tracking-tight leading-none">94 Cafe & Chinese</h1>
          </div>
        </div>

        {/* Tab Buttons in Header */}
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200">
          <button 
            onClick={() => setActiveTab("kds")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "kds" 
                ? "bg-red-600 text-white shadow-sm" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <FaClipboardList /> Kitchen Display (KDS)
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "history" 
                ? "bg-red-600 text-white shadow-sm" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <FaHistory /> Order History
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "analytics" 
                ? "bg-red-600 text-white shadow-sm" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <FaChartPie /> Reports & Analytics
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button 
            onClick={refreshData} 
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-bold shadow-sm transition"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button 
            onClick={logout} 
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2.5 text-xs font-bold transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto space-y-6">
        
        {/* Real-time Cards row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Orders Today</span>
            <p className="mt-2 text-3xl font-black text-neutral-800">{calculatedMetrics.totalToday}</p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Today's Total Count</p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Pending Orders</span>
            <p className="mt-2 text-3xl font-black text-amber-800">{calculatedMetrics.pending}</p>
            <p className="text-[9px] font-bold text-amber-500 mt-1 uppercase">Needs Attention</p>
          </div>
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50/20 p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Completed Orders</span>
            <p className="mt-2 text-3xl font-black text-indigo-800">{calculatedMetrics.completed}</p>
            <p className="text-[9px] font-bold text-indigo-500 mt-1 uppercase">Served / Paid Orders</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Revenue Today</span>
            <p className="mt-2 text-3xl font-black text-emerald-800">₹{calculatedMetrics.revenueToday.toFixed(2)}</p>
            <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">Total Completed Value</p>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && orders.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center text-neutral-500 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            <span className="font-bold text-xs">Fetching latest kitchen data...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* KITCHEN DISPLAY SYSTEM TAB */}
            {activeTab === "kds" && (
              <motion.div 
                key="kds-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Active Orders Subtitle & Filter Options */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/60 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-neutral-800 flex items-center gap-2">
                      Active Orders <span className="bg-red-100 text-red-600 rounded-full px-2.5 py-0.5 text-xs font-black">{calculatedMetrics.activeOrders.length}</span>
                    </h2>
                    <p className="text-[11px] text-neutral-400 font-semibold mt-0.5">Currently being processed or waiting in line</p>
                  </div>
                  
                  {/* KDS Status Filter Buttons */}
                  <div className="flex items-center gap-1.5 bg-white border border-neutral-200 p-1 rounded-2xl shadow-sm self-start">
                    {["All", "Pending", "Accepted", "Cooking", "Ready", "Served"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setKdsFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition ${
                          kdsFilter === status 
                            ? "bg-neutral-800 text-white shadow-sm" 
                            : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Layout of Orders */}
                <div className="grid gap-5 xl:grid-cols-2">
                  {filteredActiveOrders.map((order) => (
                    <OrderCard key={order._id} order={order} onStatusChange={changeStatus} />
                  ))}
                  {filteredActiveOrders.length === 0 && (
                    <div className="col-span-full rounded-3xl border border-neutral-200 bg-white p-12 text-center text-neutral-500 shadow-sm font-bold">
                      No active orders matched the selected filter.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ORDER HISTORY TAB */}
            {activeTab === "history" && (
              <motion.div 
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Search & Status Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-neutral-200/60 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-neutral-800 flex items-center gap-2">
                      Recent Orders History <span className="bg-neutral-200 text-neutral-700 rounded-full px-2.5 py-0.5 text-xs font-black">{orders.length}</span>
                    </h2>
                    <p className="text-[11px] text-neutral-400 font-semibold mt-0.5">Comprehensive list of all past orders</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:w-64">
                      <FaSearch className="absolute left-3.5 top-3 text-neutral-400" size={12} />
                      <input
                        type="text"
                        placeholder="Search by table, item or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-bold text-neutral-800 focus:outline-none focus:border-red-500 shadow-sm"
                      />
                    </div>

                    {/* Status Select Filter */}
                    <select
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="bg-white border border-neutral-200 rounded-2xl px-4 py-2 text-xs font-bold text-neutral-800 focus:outline-none focus:border-red-500 shadow-sm"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Cooking">Cooking</option>
                      <option value="Ready">Ready</option>
                      <option value="Served">Served</option>
                      <option value="Completed">Completed</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* List layout of filtered orders */}
                <div className="grid gap-5 xl:grid-cols-2">
                  {filteredHistoryOrders.map((order) => (
                    <OrderCard key={order._id} order={order} onStatusChange={changeStatus} />
                  ))}
                  {filteredHistoryOrders.length === 0 && (
                    <div className="col-span-full rounded-3xl border border-neutral-200 bg-white p-12 text-center text-neutral-500 shadow-sm font-bold">
                      No orders found matching the filter or search query.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* REPORTS & ANALYTICS TAB */}
            {activeTab === "analytics" && (
              <motion.div 
                key="analytics-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]"
              >
                {/* Left Side Analytics Panels */}
                <div className="space-y-6">
                  {/* Revenue Summary Panel */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div>
                        <h3 className="font-black text-neutral-800 flex items-center gap-2">
                          <FaCoins className="text-red-500" /> Revenue Summary Statistics
                        </h3>
                        <p className="text-[10px] text-neutral-400 font-bold mt-0.5">Revenue calculated from Completed & Paid orders</p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">Real-time</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Daily Revenue</span>
                        <p className="mt-2 text-xl font-black text-neutral-800">₹{calculatedMetrics.revenueToday.toFixed(2)}</p>
                        <p className="text-[8px] font-bold text-neutral-400 mt-1 uppercase">Today's total sales</p>
                      </div>
                      <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Weekly Revenue</span>
                        <p className="mt-2 text-xl font-black text-neutral-800">₹{calculatedMetrics.revenueWeekly.toFixed(2)}</p>
                        <p className="text-[8px] font-bold text-neutral-400 mt-1 uppercase">Last 7 days sales</p>
                      </div>
                      <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Monthly Revenue</span>
                        <p className="mt-2 text-xl font-black text-neutral-800">₹{calculatedMetrics.revenueMonthly.toFixed(2)}</p>
                        <p className="text-[8px] font-bold text-neutral-400 mt-1 uppercase">Last 30 days sales</p>
                      </div>
                    </div>

                    {/* Timeline Graph */}
                    <div className="mt-6 border-t border-neutral-100 pt-5">
                      <h4 className="text-xs font-black text-neutral-700 uppercase tracking-wider mb-4">Daily Sales Trend (Last 7 Days)</h4>
                      <div className="flex h-56 items-end gap-3 md:gap-5 px-2">
                        {stats.timeline?.slice(-7).map((day, index) => {
                          const maxRevenue = Math.max(...(stats.timeline?.map(t => t.total) || [1]), 1);
                          const height = (day.total / maxRevenue) * 100;
                          return (
                            <div key={index} className="flex flex-1 flex-col items-center gap-1.5 group relative cursor-pointer">
                              <div 
                                className="w-full rounded-t-xl bg-gradient-to-t from-red-600 to-red-400 transition-all hover:brightness-105 shadow-sm"
                                style={{ height: `${Math.max(height, 5)}%` }}
                              />
                              <span className="text-[9px] text-neutral-400 font-bold">{day._id.slice(-5)}</span>
                              
                              {/* Hover Tooltip */}
                              <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform duration-100 bg-neutral-900 text-white p-2 rounded-xl text-[9px] text-center z-10 w-max border border-neutral-800 shadow-md">
                                <p className="font-bold text-red-400">₹{day.total.toFixed(2)}</p>
                                <p className="text-[8px] opacity-65">{day.count} orders</p>
                              </div>
                            </div>
                          );
                        })}
                        {(!stats.timeline || stats.timeline.length === 0) && (
                          <div className="w-full text-center text-neutral-400 py-10 font-bold">
                            No sales trend data available.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Best Selling Items Table */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-black text-neutral-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <FaChartLine className="text-red-500" /> Best Selling Items
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-bold text-neutral-500">
                        <thead className="text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                          <tr>
                            <th className="pb-2">Item Name</th>
                            <th className="pb-2 text-center">Qty Sold</th>
                            <th className="pb-2 text-right">Revenue Generated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {stats.topItems?.slice(0, 5).map((item) => (
                            <tr key={item._id} className="text-neutral-600 font-semibold hover:bg-neutral-50/50 transition-colors">
                              <td className="py-3 font-black text-neutral-800">{item._id}</td>
                              <td className="py-3 text-center">{item.totalQty}</td>
                              <td className="py-3 text-right font-mono font-black text-red-600">₹{item.totalRevenue.toFixed(2)}</td>
                            </tr>
                          ))}
                          {(!stats.topItems || stats.topItems.length === 0) && (
                            <tr>
                              <td colSpan={3} className="text-center py-6 text-neutral-400 font-bold">
                                No menu items sales recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Side Analytics Panels */}
                <div className="space-y-6">
                  {/* Category Breakdown Panel */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-black text-neutral-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <FaTags className="text-red-500" /> Most Ordered Categories
                    </h3>
                    <div className="space-y-3.5">
                      {calculatedMetrics.mostOrderedCategories.slice(0, 6).map((cat, idx) => {
                        const maxQty = Math.max(...calculatedMetrics.mostOrderedCategories.map(c => c.qty), 1);
                        const percent = (cat.qty / maxQty) * 100;
                        return (
                          <div key={cat.name} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-black text-neutral-700">
                              <span>{cat.name}</span>
                              <span className="text-neutral-500">{cat.qty} items</span>
                            </div>
                            <div className="w-full bg-neutral-150 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {calculatedMetrics.mostOrderedCategories.length === 0 && (
                        <div className="text-center text-neutral-400 py-6 font-bold text-xs">
                          No category statistics available.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Status Overview */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-black text-neutral-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <FaCreditCard className="text-red-500" /> Payment Status Overview
                    </h3>
                    <div className="space-y-4">
                      {/* Paid Progress bar info */}
                      <div className="flex items-center justify-between border-b border-neutral-50 pb-2.5 text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          <span className="text-neutral-600">Paid Bills ({calculatedMetrics.paymentStatus.paidCount})</span>
                        </div>
                        <span className="font-black text-neutral-800">₹{calculatedMetrics.paymentStatus.paidSum.toFixed(2)}</span>
                      </div>
                      
                      {/* Unpaid Progress bar info */}
                      <div className="flex items-center justify-between border-b border-neutral-50 pb-2.5 text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          <span className="text-neutral-600">Pending Bills ({calculatedMetrics.paymentStatus.unpaidCount})</span>
                        </div>
                        <span className="font-black text-neutral-800">₹{calculatedMetrics.paymentStatus.unpaidSum.toFixed(2)}</span>
                      </div>

                      {/* Total progress calculation */}
                      <div className="pt-2 text-xs text-neutral-400 font-bold flex justify-between uppercase tracking-wider">
                        <span>Total Active Turnover</span>
                        <span className="text-neutral-700 font-black">
                          ₹{(calculatedMetrics.paymentStatus.paidSum + calculatedMetrics.paymentStatus.unpaidSum).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Recent Orders Feed */}
                  <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="font-black text-neutral-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <FaClipboardList className="text-red-500" /> Recent Activity Log
                    </h3>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {calculatedMetrics.recentOrders.map((o) => (
                        <div key={o._id} className="flex justify-between items-center rounded-2xl bg-neutral-50 border border-neutral-100 p-3 text-xs font-semibold">
                          <div>
                            <span className="block font-black text-neutral-800">Table {o.tableNumber}</span>
                            <span className="text-[10px] text-neutral-400 font-bold block mt-0.5">
                              ID: #{o._id.slice(-6)} • {new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full border font-bold bg-white text-neutral-500 border-neutral-200 uppercase">
                            {o.status}
                          </span>
                        </div>
                      ))}
                      {calculatedMetrics.recentOrders.length === 0 && (
                        <div className="text-center text-neutral-400 py-6 font-bold text-xs">
                          No order activity logged.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
