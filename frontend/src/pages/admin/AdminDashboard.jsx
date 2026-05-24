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
      <div className="flex h-screen items-center justify-center bg-black text-white/55">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
        <span className="ml-3">Loading dashboard analytics...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-red-400">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const cards = [
    {
      label: "Monthly Revenue",
      value: `₹${(stats.monthlyRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FaArrowTrendUp,
      gradient: "from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20"
    },
    {
      label: "Monthly Expenses",
      value: `₹${Number(expenseSummary.monthTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FaMoneyBillWave,
      gradient: "from-rose-500/10 to-red-500/5 text-rose-400 border-rose-500/20"
    },
    {
      label: "Total Orders",
      value: stats.totalOrders || 0,
      icon: FaClipboardCheck,
      gradient: "from-blue-500/10 to-indigo-500/5 text-blue-400 border-blue-500/20"
    },
    {
      label: "Active Tables",
      value: stats.activeTables || 0,
      icon: FaUtensils,
      gradient: "from-amber-500/10 to-orange-500/5 text-amber-400 border-amber-500/20"
    },
    {
      label: "Popular Item",
      value: stats.topItems?.[0]?._id || "None",
      icon: FaBurger,
      gradient: "from-purple-500/10 to-fuchsia-500/5 text-purple-400 border-purple-500/20"
    }
  ];

  const maxTimelineRevenue = Math.max(...(stats.timeline?.map(t => t.total) || [1]), 1);

  return (
    <section className="min-h-screen bg-black px-4 py-8 text-white sm:px-8">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,.05),transparent_40%)] pointer-events-none" />

      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-gold-400 font-semibold">Bistro Management Portal</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Admin Overview</h1>
      </header>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.article 
              key={card.label} 
              whileHover={{ y: -4, scale: 1.01 }}
              className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${card.gradient} p-6 shadow-xl backdrop-blur-md`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-wider opacity-60">{card.label}</span>
                <Icon className="text-xl" />
              </div>
              <p className="mt-6 truncate text-2xl font-black tracking-tight">{card.value}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_.7fr]">
        {/* Revenue Chart */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Revenue Analytics (Last 7 Days)</h2>
            <span className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">Daily Sales</span>
          </div>

          <div className="mt-8 flex h-64 items-end gap-3 sm:gap-4 md:gap-6">
            {stats.timeline?.slice(-7).map((day, index) => {
              const height = (day.total / maxTimelineRevenue) * 100;
              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-2 group relative">
                  <div 
                    className="w-full rounded-t-xl bg-gradient-to-t from-gold-600 to-amber-400 transition-all duration-300 hover:brightness-125 cursor-pointer shadow-glow-gold" 
                    style={{ height: `${Math.max(height, 5)}%` }} 
                  />
                  <span className="text-[10px] text-white/45 font-mono">{day._id.slice(-5)}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform duration-200 bg-neutral-900 border border-gold-400/30 p-2 rounded-2xl text-xs text-center z-10 w-max shadow-2xl">
                    <p className="font-bold text-gold-400">₹{day.total.toFixed(2)}</p>
                    <p className="text-[10px] text-white/50">{day.count} orders</p>
                  </div>
                </div>
              );
            })}
            {(!stats.timeline || stats.timeline.length === 0) && (
              <div className="w-full text-center text-white/50 py-10">No recent sales data found.</div>
            )}
          </div>
        </div>

        {/* Real-time Orders Feed */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Recent Orders</h2>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-4 max-h-[268px] overflow-y-auto pr-1">
            {orders?.slice(0, 5).map((order) => {
              const statusColors = {
                "Pending": "bg-amber-500/10 text-amber-400 border-amber-500/20",
                "Accepted": "bg-blue-500/10 text-blue-400 border-blue-500/20",
                "Cooking": "bg-purple-500/10 text-purple-400 border-purple-500/20",
                "Ready": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                "Served": "bg-green-500/10 text-green-400 border-green-500/20",
                "Paid": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                "Completed": "bg-gray-500/10 text-gray-400 border-gray-500/20",
                "Cancelled": "bg-rose-500/10 text-rose-400 border-rose-500/20"
              };
              return (
                <div key={order._id} className="flex justify-between items-center rounded-2xl bg-black/40 border border-white/5 p-4 text-sm transition-all hover:bg-black/60">
                  <div className="min-w-0">
                    <span className="block font-bold text-white">Table {order.tableNumber}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[order.status] || "bg-white/5 text-white border-white/10"}`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <FaClock size={8} /> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  <span className="text-gold-400 font-bold tracking-tight">₹{order.total?.toFixed(2) || "0.00"}</span>
                </div>
              );
            })}
            {(!orders || orders.length === 0) && (
              <p className="text-white/55 text-center py-10">No recent orders recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Popular Items breakdown */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
        <h2 className="text-xl font-bold tracking-tight mb-5">Top Selling Menu Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="text-xs uppercase tracking-wider text-white/40 border-b border-white/10">
              <tr>
                <th className="pb-3 font-semibold">Item Name</th>
                <th className="pb-3 font-semibold text-center">Quantity Sold</th>
                <th className="pb-3 font-semibold text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.topItems?.map((item) => (
                <tr key={item._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 font-bold text-white">{item._id}</td>
                  <td className="py-4 text-center font-mono">{item.totalQty}</td>
                  <td className="py-4 text-right font-mono text-gold-400">₹{item.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
              {(!stats.topItems || stats.topItems.length === 0) && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-white/40">No menu sales records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
