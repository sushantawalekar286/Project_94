import { useEffect, useState } from "react";
import { FaArrowTrendUp, FaBurger, FaClipboardCheck, FaMoneyBillWave, FaUtensils, FaClock } from "react-icons/fa6";
import { getOrders } from "../../services/orderService";
import { getDashboardStats } from "../../services/salesService";
import { useSocket } from "../../hooks/useSocket";
import toast from "react-hot-toast";
import { getExpenseSummary } from "../../services/expenseService";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    today: { todayRevenue: 0, todayOrders: 0, pendingOrders: 0 },
    topItems: [],
    lowStockCount: 0,
    timeline: [],
    monthlyRevenue: 0,
    totalOrders: 0,
    activeTables: 0
  });
  const [expenseSummary, setExpenseSummary] = useState({ monthTotal: 0, todayTotal: 0, weekTotal: 0, monthlySeries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const socket = useSocket();

  const refreshOrders = () => getOrders().then((res) => {
    const arrayData = res.data?.data || res.data || [];
    setOrders(Array.isArray(arrayData) ? arrayData : []);
  }).catch((err) => {
    console.error("[AdminDashboard] Error refreshing orders:", err);
    setOrders([]);
    throw err;
  });

  const refreshStats = () => getDashboardStats().then((res) => {
    const statsData = res.data?.data || res.data || {};
    setStats({
      today: statsData.today || { todayRevenue: 0, todayOrders: 0, pendingOrders: 0 },
      topItems: statsData.topItems || [],
      lowStockCount: statsData.lowStockCount || 0,
      timeline: statsData.timeline || [],
      monthlyRevenue: statsData.monthlyRevenue || 0,
      totalOrders: statsData.totalOrders || 0,
      activeTables: statsData.activeTables || 0
    });
  }).catch((err) => {
    console.error("[AdminDashboard] Error refreshing stats:", err);
    throw err;
  });

  const refreshExpenses = () => getExpenseSummary().then((res) => {
    const d = res.data || {};
    setExpenseSummary({
      monthTotal: d.monthTotal || 0,
      todayTotal: d.todayTotal || 0,
      weekTotal: d.weekTotal || 0,
      monthlySeries: d.monthlySeries || []
    });
  }).catch((err) => {
    console.error("[AdminDashboard] Error refreshing expenses:", err);
    setExpenseSummary({ monthTotal: 0, todayTotal: 0, weekTotal: 0, monthlySeries: [] });
    throw err;
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([refreshOrders(), refreshStats(), refreshExpenses()])
      .then(() => setError(false))
      .catch((err) => {
        console.error("[AdminDashboard] Mount data fetch failed:", err.message);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join:admin");
    
    const handleNewOrder = () => {
      toast.success("New order received");
      refreshOrders().catch(() => {});
      refreshStats().catch(() => {});
    };
    
    const handleOrderUpdate = () => {
      refreshOrders().catch(() => {});
      refreshStats().catch(() => {});
    };
    
    const handleExpenseCreated = () => {
      refreshExpenses().catch(() => {});
      refreshStats().catch(() => {});
    };

    socket.on("order:new", handleNewOrder);
    socket.on("order:updated", handleOrderUpdate);
    window.addEventListener("expense:created", handleExpenseCreated);

    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:updated", handleOrderUpdate);
      window.removeEventListener("expense:created", handleExpenseCreated);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-neutral-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        <span className="ml-3 font-bold text-xs">Loading dashboard analytics...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-red-600 font-bold">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const cards = [
    {
      label: "Monthly Revenue",
      value: `₹${(stats.monthlyRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FaArrowTrendUp,
      gradient: "border-emerald-100 bg-emerald-50/50 text-emerald-700"
    },
    {
      label: "Monthly Expenses",
      value: `₹${Number(expenseSummary.monthTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FaMoneyBillWave,
      gradient: "border-rose-100 bg-rose-50/50 text-rose-700"
    },
    {
      label: "Total Orders",
      value: stats.totalOrders || 0,
      icon: FaClipboardCheck,
      gradient: "border-blue-100 bg-blue-50/50 text-blue-700"
    },
    {
      label: "Active Tables",
      value: stats.activeTables || 0,
      icon: FaUtensils,
      gradient: "border-amber-100 bg-amber-50/50 text-amber-700"
    },
    {
      label: "Popular Item",
      value: stats.topItems?.[0]?._id || "None",
      icon: FaBurger,
      gradient: "border-purple-100 bg-purple-50/50 text-purple-700"
    }
  ];

  const maxTimelineRevenue = Math.max(...(stats.timeline?.map(t => t.total) || [1]), 1);

  return (
    <section className="min-h-screen bg-[#FAF9F6] px-4 py-8 text-neutral-800 sm:px-8">
      
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">
          94 Cafe & Chinese Portal
        </p>
        <h1 className="mt-1 text-3xl font-black text-neutral-800 leading-tight tracking-tight">
          Admin Overview
        </h1>
      </header>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.article 
              key={card.label} 
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden rounded-3xl border bg-white ${card.gradient} p-6 shadow-sm`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{card.label}</span>
                <Icon className="text-lg opacity-80" />
              </div>
              <p className="mt-5 truncate text-2xl font-black text-neutral-800 tracking-tight leading-none">{card.value}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        
        {/* Revenue Chart */}
        <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-neutral-800 tracking-tight">
              Revenue Analytics (Last 7 Days)
            </h2>
            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">Daily Sales</span>
          </div>

          <div className="mt-8 flex h-64 items-end gap-3 sm:gap-4 md:gap-6 px-2">
            {stats.timeline?.slice(-7).map((day, index) => {
              const height = (day.total / maxTimelineRevenue) * 100;
              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-2 group relative">
                  <div 
                    className="w-full rounded-t-xl bg-gradient-to-t from-red-600 to-red-400 transition-all duration-300 hover:brightness-105 cursor-pointer shadow-sm" 
                    style={{ height: `${Math.max(height, 5)}%` }} 
                  />
                  <span className="text-[10px] text-neutral-400 font-bold">{day._id.slice(-5)}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform duration-150 bg-neutral-900 border border-neutral-800 p-2 rounded-xl text-[10px] text-center z-10 w-max text-white shadow-md">
                    <p className="font-bold text-red-400">₹{day.total.toFixed(2)}</p>
                    <p className="text-[9px] text-white/50">{day.count} orders</p>
                  </div>
                </div>
              );
            })}
            {(!stats.timeline || stats.timeline.length === 0) && (
              <div className="w-full text-center text-neutral-500 py-10 flex flex-col items-center justify-center">
                <span>No recent sales data found.</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Orders Feed */}
        <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-black text-neutral-800 tracking-tight">
              Recent Orders
            </h2>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-3.5 max-h-[268px] overflow-y-auto pr-1">
            {orders?.slice(0, 5).map((order) => {
              const statusColors = {
                "Pending": "bg-amber-50 text-amber-700 border-amber-200",
                "Accepted": "bg-blue-50 text-blue-700 border-blue-200",
                "Cooking": "bg-purple-50 text-purple-700 border-purple-200",
                "Ready": "bg-indigo-50 text-indigo-700 border-indigo-200",
                "Served": "bg-green-50 text-green-700 border-green-200",
                "Paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
                "Completed": "bg-neutral-50 text-neutral-700 border-neutral-200",
                "Cancelled": "bg-rose-50 text-rose-700 border-rose-200"
              };
              return (
                <div key={order._id} className="flex justify-between items-center rounded-2xl bg-neutral-50 border border-neutral-100 p-4 text-xs font-semibold hover:bg-neutral-100/50 transition-colors">
                  <div className="min-w-0">
                    <span className="block font-black text-neutral-800">Table {order.tableNumber}</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${statusColors[order.status] || "bg-white text-neutral-500 border-neutral-200"}`}>
                        {order.status}
                      </span>
                      <span className="text-[9px] text-neutral-400 flex items-center gap-1 font-bold">
                        <FaClock size={8} /> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  <span className="text-neutral-800 font-black tracking-tight">₹{order.total?.toFixed(2) || "0.00"}</span>
                </div>
              );
            })}
            {(!orders || orders.length === 0) && (
              <div className="text-neutral-400 text-center py-10 flex flex-col items-center justify-center">
                <span>No recent orders recorded.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Items breakdown */}
      <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm">
        <h2 className="text-base font-black text-neutral-800 tracking-tight mb-5">
          Top Selling Menu Items
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold text-neutral-600">
            <thead className="text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
              <tr>
                <th className="pb-3 font-semibold">Item Name</th>
                <th className="pb-3 font-semibold text-center">Quantity Sold</th>
                <th className="pb-3 font-semibold text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {stats.topItems?.map((item) => (
                <tr key={item._id} className="hover:bg-neutral-50/50 transition-colors text-neutral-600 font-semibold">
                  <td className="py-4 font-black text-neutral-800">{item._id}</td>
                  <td className="py-4 text-center font-mono">{item.totalQty}</td>
                  <td className="py-4 text-right font-mono font-black text-red-600">₹{item.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
              {(!stats.topItems || stats.topItems.length === 0) && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-neutral-500 font-bold">
                    No menu sales records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
