import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { useCart } from "../../hooks/useCart";
import { getActiveOrderByTable } from "../../services/orderService";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaClock, FaCheckCircle, FaConciergeBell, FaChevronRight } from "react-icons/fa";

const steps = ["Pending", "Accepted", "Cooking", "Ready", "Served", "Paid"];

const getStatusIndex = (status) => {
  const map = {
    Pending: 0,
    Accepted: 1,
    Cooking: 2,
    Ready: 3,
    Served: 4,
    Paid: 5,
    Completed: 5
  };
  return map[status] ?? 0;
};

const getStatusMessage = (status) => {
  const messages = {
    Pending: "Sent to the kitchen. Waiting for approval.",
    Accepted: "Chef accepted your order.",
    Cooking: "Your meal is being cooked fresh.",
    Ready: "Order is ready to serve!",
    Served: "Served and delicious. Enjoy your food!",
    Paid: "Paid! Thank you for dining with us.",
    Completed: "Completed! Thank you for dining with us."
  };
  return messages[status] || "Processing your order...";
};

export default function OrderTrackingPage() {
  const { state } = useLocation();
  const { tableSession } = useCart();
  const navigate = useNavigate();
  const socket = useSocket();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [remainingTime, setRemainingTime] = useState("");

  // Re-fetch latest active order on reload or mount
  useEffect(() => {
    const storedTableNum = localStorage.getItem("tableNumber");
    const tableNum = tableSession.tableNumber || Number(storedTableNum) || 1;
    if (!order) {
      setLoading(true);
      getActiveOrderByTable(tableNum)
        .then((res) => {
          if (res.data?.active && res.data?.order) {
            setOrder(res.data.order);
            localStorage.setItem("activeOrderId", res.data.order._id);
            localStorage.setItem("tableNumber", String(tableNum));
          } else {
            setOrder(null);
          }
        })
        .catch((err) => console.error("Error fetching active order:", err))
        .finally(() => setLoading(false));
    }
  }, [tableSession.tableNumber, order]);

  // Socket.IO updates
  useEffect(() => {
    if (!socket || !order?._id) return;
    socket.emit("join:order", order._id);
    socket.on("order:updated", (updatedOrder) => {
      if (updatedOrder._id === order._id) {
        setOrder(updatedOrder);
      }
    });
    return () => {
      socket.off("order:updated");
    };
  }, [socket, order?._id]);

  // Handle 5 minutes auto-expire timer for Completed / Paid orders
  useEffect(() => {
    if (!order) return;
    const isFinished = order.status === "Completed" || order.status === "Paid";
    if (!isFinished) {
      setRemainingTime("");
      return;
    }

    const referenceTime = order.completedAt || order.paidAt || order.updatedAt;
    const expiryTime = new Date(referenceTime).getTime() + 5 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = expiryTime - now;

      if (difference <= 0) {
        clearInterval(interval);
        // Clear local active order & return to menu
        localStorage.removeItem("activeOrderId");
        navigate("/customer/menu", { state: { fromTracking: true } });
      } else {
        const minutes = Math.floor(difference / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        setRemainingTime(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] text-neutral-800">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-neutral-400">Retrieving active order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] px-5 text-neutral-800">
        <div className="relative text-center max-w-sm p-6 border border-neutral-100 bg-white rounded-3xl shadow-sm">
          <FaConciergeBell className="mx-auto text-4xl text-red-600 mb-4" />
          <h2 className="text-xl font-black text-neutral-800">No Active Order</h2>
          <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
            We couldn't find any active orders for Table {tableSession.tableNumber || localStorage.getItem("tableNumber") || 1}. Scan your table QR code to place an order.
          </p>
          <Link className="mt-6 w-full rounded-2xl bg-red-600 text-white text-xs font-black py-3 shadow-md hover:bg-red-700 active:scale-95 transition-all text-center block" to="/customer/menu">
            Go to Menu
          </Link>
        </div>
      </section>
    );
  }

  const activeIndex = getStatusIndex(order.status);

  return (
    <section className="relative min-h-screen bg-[#FAF9F6] text-neutral-800 px-4 py-6 pb-10">
      <div className="mx-auto max-w-lg space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link 
            to="/customer/menu" 
            state={{ fromTracking: true }} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-red-600 transition-colors"
          >
            <FaArrowLeft /> MENU
          </Link>
          <div className="rounded-full bg-red-50 px-3.5 py-1 text-[10px] font-black text-red-600 border border-red-100">
            Table {order.tableNumber}
          </div>
        </header>

        {/* Live Status Card */}
        <div className="rounded-3xl bg-white border border-neutral-100 p-5 shadow-sm space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-600">Live Status</span>
          <h1 className="text-2xl font-black text-neutral-800 tracking-tight leading-none">{order.status}</h1>
          <p className="text-xs text-neutral-400 leading-normal">{getStatusMessage(order.status)}</p>

          {remainingTime && (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-2xl">
              <FaClock className="animate-pulse" />
              <span>Clearing tracking in <strong>{remainingTime}</strong></span>
            </div>
          )}
        </div>

        {/* Timeline List */}
        <div className="rounded-3xl bg-white border border-neutral-100 p-6 shadow-sm space-y-5">
          <h3 className="font-black text-base text-neutral-800 tracking-tight">Order Timeline</h3>
          <div className="relative pl-6 border-l-2 border-neutral-100 ml-2 space-y-6">
            {steps.map((step, idx) => {
              const isCurrent = idx === activeIndex;
              const isDone = idx < activeIndex;
              const isActive = idx <= activeIndex;
              return (
                <div key={step} className="relative">
                  {/* Timeline dot */}
                  <span className={`absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCurrent ? "bg-red-600 border-red-600 scale-110 shadow-sm" :
                    isDone ? "bg-green-600 border-green-600" : "bg-white border-neutral-200"
                  }`}>
                    {isDone && <FaCheckCircle className="text-white text-[10px]" />}
                  </span>

                  <div className="flex flex-col">
                    <span className={`font-black text-xs ${isActive ? "text-neutral-800" : "text-neutral-400"}`}>
                      {step}
                    </span>
                    {isCurrent && (
                      <motion.span layoutId="timeline-hint" className="text-[9px] font-bold text-red-600 mt-0.5 uppercase tracking-wide">
                        Active Stage
                      </motion.span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Receipt Details Card */}
        <aside className="rounded-3xl bg-white border border-neutral-100 p-5 shadow-sm space-y-4">
          <h3 className="font-black text-base text-neutral-800 border-b border-neutral-100 pb-3">Order Details</h3>
          
          <div className="text-[10px] text-neutral-400 space-y-0.5">
            <p>Order ID: <span className="font-mono text-neutral-600">{order._id}</span></p>
            <p>Placed: <span className="text-neutral-600">{new Date(order.createdAt).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</span></p>
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 divide-y divide-neutral-50">
            {order.items.map((item, idx) => (
              <div key={item._id || item.menuItem || idx} className="flex justify-between items-start text-xs pt-2.5 first:pt-0">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="font-bold text-neutral-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-neutral-400">
                    Qty: {item.quantity} {item.portionType !== "single" && `· ${item.portionType}`}
                  </p>
                </div>
                <span className="font-extrabold text-neutral-700">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Pricing breakdowns */}
          <div className="border-t border-neutral-100 my-4 pt-3.5 space-y-2 text-xs text-neutral-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-neutral-700">₹{order.subtotal?.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="font-bold text-green-600">-₹{order.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-neutral-800 pt-2 border-t border-neutral-100">
              <span>Grand Total</span>
              <span className="text-red-600">₹{order.total?.toFixed(2)}</span>
            </div>
          </div>
        </aside>

        {/* Back button */}
        <Link 
          to="/customer/menu" 
          state={{ fromTracking: true }} 
          className="w-full flex items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 bg-white py-4 text-center text-xs font-bold text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all shadow-sm"
        >
          Return to Menu <FaChevronRight size={10} />
        </Link>

      </div>
    </section>
  );
}
