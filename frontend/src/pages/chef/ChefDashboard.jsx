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
    const res = await getOrders();
    setOrders(res.data.filter((order) => order.status !== "Cancelled"));
    setLoading(false);
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
    const timer = setInterval(() => refresh().catch(() => {}), 15000);
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
    preparing: orders.filter((order) => order.status === "Preparing").length,
    completed: orders.filter((order) => order.status === "Completed").length
  }), [orders]);

  const changeStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    toast.success(`Order marked ${status}`);
    refresh();
  };

  return (
    <section className="min-h-screen bg-[#080808] px-4 py-6 text-white sm:px-8">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-gold-400"><FaFire /> Chef Panel</p>
          <h1 className="mt-2 text-4xl font-black">Incoming Orders</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold hover:text-gold-400">
            <FaSyncAlt /> Refresh
          </button>
          <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/10 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="mb-7 grid gap-3 sm:grid-cols-3">
        {Object.entries(metrics).map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <p className="capitalize text-white/55">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/60">Loading orders...</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {orders.map((order) => <OrderCard key={order._id} order={order} onStatusChange={changeStatus} />)}
          {!orders.length && <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/60">No active orders yet.</div>}
        </div>
      )}
    </section>
  );
}
