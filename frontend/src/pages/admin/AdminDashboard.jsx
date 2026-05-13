import { useEffect, useState } from "react";
import { FaArrowTrendUp, FaBurger, FaClipboardCheck, FaTriangleExclamation } from "react-icons/fa6";
import { getOrders } from "../../services/orderService";
import { getDashboardStats } from "../../services/salesService";
import { useSocket } from "../../hooks/useSocket";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    today: { todayRevenue: 0, todayOrders: 0, pendingOrders: 0 },
    topItems: [],
    lowStockCount: 0,
    timeline: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const socket = useSocket();

  const refreshOrders = () => getOrders().then((res) => {
    const arrayData = res.data?.data || res.data || [];
    setOrders(Array.isArray(arrayData) ? arrayData : []);
  }).catch(() => setOrders([]));

  const refreshStats = () => getDashboardStats().then((res) => {
    const statsData = res.data?.data || res.data || {};
    setStats({
      today: statsData.today || { todayRevenue: 0, todayOrders: 0, pendingOrders: 0 },
      topItems: statsData.topItems || [],
      lowStockCount: statsData.lowStockCount || 0,
      timeline: statsData.timeline || []
    });
  }).catch(() => {});

  useEffect(() => {
    setLoading(true);
    Promise.all([refreshOrders(), refreshStats()])
      .then(() => setError(false))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join:admin");
    
    const handleNewOrder = () => {
      toast.success("New order received");
      refreshOrders();
      refreshStats();
    };
    
    const handleOrderUpdate = () => {
      refreshOrders();
      refreshStats();
    };
    
    socket.on("order:new", handleNewOrder);
    socket.on("order:updated", handleOrderUpdate);

    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:updated", handleOrderUpdate);
    };
  }, [socket]);

  if (loading) return <div className="flex h-screen items-center justify-center text-white/55">Loading dashboard...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-400">Failed to load dashboard.</div>;

  const cards = [
    ["Today's Revenue", `₹${stats.today?.todayRevenue?.toFixed(2) || "0.00"}`, FaArrowTrendUp],
    ["Pending Orders", stats.today?.pendingOrders || 0, FaClipboardCheck],
    ["Best Selling", stats.topItems?.[0]?._id || "None", FaBurger],
    ["Low Stock Alerts", stats.lowStockCount || 0, FaTriangleExclamation]
  ];

  // Calculate max height for chart scaling
  const maxTimelineRevenue = Math.max(...(stats.timeline?.map(t => t.total) || [1]), 1);

  return (
    <section className="px-4 py-6 sm:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Admin monitors sales and inventory</p>
      <h1 className="mt-2 text-4xl font-black">Admin Dashboard</h1>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <article key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-card">
            <Icon className="text-2xl text-gold-400" />
            <p className="mt-5 text-sm text-white/55">{label}</p>
            <p className="mt-1 truncate text-2xl font-black">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-xl font-black">Revenue Analytics (Last 7 Days)</h2>
          <div className="mt-6 flex h-64 items-end gap-3">
            {stats.timeline?.slice(-7).map((day, index) => {
              const height = (day.total / maxTimelineRevenue) * 100;
              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-2 group relative">
                  <div 
                    className="w-full rounded-t-2xl bg-gradient-to-t from-primary-500 to-gold-400 transition-all hover:brightness-125" 
                    style={{ height: `${Math.max(height, 5)}%` }} 
                  />
                  <span className="text-xs text-white/45">{day._id.slice(-5)}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black border border-white/20 p-2 rounded text-xs text-center z-10 w-max">
                    ₹{day.total.toFixed(2)}<br/>
                    <span className="text-white/50">{day.count} orders</span>
                  </div>
                </div>
              );
            })}
            {(!stats.timeline || stats.timeline.length === 0) && <div className="w-full text-center text-white/50 self-center">No recent sales data.</div>}
          </div>
        </div>
        
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
          <h2 className="text-xl font-black">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {orders?.slice(0, 5).map((order) => (
              <div key={order._id} className="flex justify-between items-center rounded-2xl bg-black/30 p-3 text-sm">
                <div>
                  <span className="block font-bold">Table {order.tableNumber}</span>
                  <span className="text-xs text-white/50">{order.status}</span>
                </div>
                <span className="text-gold-400 font-bold">₹{order.total?.toFixed(2) || "0.00"}</span>
              </div>
            ))}
            {(!orders || orders.length === 0) && <p className="text-white/55">No recent orders.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
