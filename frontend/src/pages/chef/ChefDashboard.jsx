import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaFire, FaSyncAlt, FaSignOutAlt } from "react-icons/fa";
import { getOrders, updateOrderStatus } from "../../services/orderService";
import OrderCard from "../../components/chef/OrderCard";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";

export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { logout } = useAuth();

  const refresh = async () => {
    console.log("[LOADING STATE] ChefDashboard loading: true");
    setLoading(true);
    try {
      const res = await getOrders();
      setOrders(res.data.filter((order) => order.status !== "Cancelled"));
    } catch (error) {
      console.error("[ChefDashboard] getOrders error:", error);
      toast.error("Failed to load orders");
    } finally {
      console.log("[LOADING STATE] ChefDashboard loading: false");
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
    const timer = setInterval(() => getOrders().then(res => {
      setOrders(res.data.filter((order) => order.status !== "Cancelled"));
    }).catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join:chef");
    
    const handleNewOrder = () => {
      toast.success("New order received");
      refresh();
    };
    
    const handleOrderUpdate = () => {
      refresh();
    };

    socket.on("order:new", handleNewOrder);
    socket.on("order:updated", handleOrderUpdate);
    
    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:updated", handleOrderUpdate);
    };
  }, [socket]);

  const metrics = useMemo(() => ({
    pending: orders.filter((order) => order.status === "Pending").length,
    cooking: orders.filter((order) => order.status === "Cooking" || order.status === "Accepted" || order.status === "Ready").length,
    completed: orders.filter((order) => order.status === "Completed" || order.status === "Paid" || order.status === "Served").length
  }), [orders]);

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Order marked ${status}`);
      await refresh();
    } catch (error) {
      console.error("[ChefDashboard] updateOrderStatus error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF9F6] px-4 py-8 text-neutral-800 sm:px-8">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-neutral-200/50 pb-5">
        <div className="flex items-center gap-3.5">
          <img src="/logo.png" alt="94 Cafe & Chinese" className="h-16 w-16 rounded-2xl object-cover shadow-md border border-neutral-200 bg-white" />
          <div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-red-600 font-black"><FaFire /> Chef Panel</p>
            <h1 className="mt-0.5 text-2xl font-black text-neutral-800 leading-none tracking-tight">Incoming Orders</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-3 text-sm font-bold shadow-sm transition">
            <FaSyncAlt /> Refresh
          </button>
          <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-3 text-sm font-bold transition">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="mb-7 grid gap-3 sm:grid-cols-3">
        {Object.entries(metrics).map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="capitalize text-[10px] font-black uppercase tracking-wider text-neutral-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-neutral-800">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-neutral-500 shadow-sm">Loading orders...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => <OrderCard key={order._id} order={order} onStatusChange={changeStatus} />)}
          {!orders.length && <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-neutral-500 shadow-sm">No active orders yet.</div>}
        </div>
      )}
    </section>
  );
}
