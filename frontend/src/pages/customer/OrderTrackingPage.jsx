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
    "Pending": 0,
    "Accepted": 1,
    "Cooking": 2,
    "Ready": 3,
    "Served": 4,
    "Paid": 5,
    "Completed": 5
  };
  return map[status] ?? 0;
};

const getStatusMessage = (status) => {
  const messages = {
    "Pending": "Sent to the kitchen. Waiting for approval.",
    "Accepted": "Chef accepted your order.",
    "Cooking": "Your meal is being cooked fresh.",
    "Ready": "Order is ready to serve!",
    "Served": "Served and delicious. Enjoy your food!",
    "Paid": "Paid! Thank you for dining with us.",
    "Completed": "Completed! Thank you for dining with us."
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
        <p className="mt-4 text-white/55">Retrieving active order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-black px-5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,.12),transparent_40%)]" />
        <div className="relative text-center max-w-md p-6 border border-white/10 bg-white/5 rounded-3xl backdrop-blur-md">
          <FaConciergeBell className="mx-auto text-5xl text-gold-400 mb-4" />
          <h2 className="text-2xl font-black">No Active Order</h2>
          <p className="mt-2 text-white/60">We couldn't find any active orders for Table {tableSession.tableNumber || localStorage.getItem("tableNumber") || 1}. Scan your table QR code to view our menu and place an order.</p>
          <Link className="btn-primary mt-6 inline-flex" to="/customer/menu">Go to Menu</Link>
        </div>
      </section>
    );
  }

  const activeIndex = getStatusIndex(order.status);

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-8 sm:px-6 lg:px-8">
      {/* Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(220,38,38,.05),transparent_40%)] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <Link to="/customer/menu" state={{ fromTracking: true }} className="inline-flex items-center gap-2 text-sm text-white/65 hover:text-gold-400 transition-colors">
            <FaArrowLeft /> Menu
          </Link>
          <div className="rounded-full bg-gold-400/10 px-4 py-1.5 text-xs font-bold text-gold-400 border border-gold-400/25">
            Table {order.tableNumber}
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
          {/* Tracking steps status */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-lg">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-bold">Live Status</span>
              <h1 className="text-3xl font-black mt-1">{order.status}</h1>
              <p className="text-sm text-white/60 mt-1">{getStatusMessage(order.status)}</p>

              {remainingTime && (
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-2xl">
                  <FaClock className="animate-pulse" />
                  <span>Clearing tracking in <strong>{remainingTime}</strong></span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
              <h3 className="font-bold text-lg text-white/90">Order Timeline</h3>
              <div className="relative pl-6 border-l-2 border-white/10 ml-2 space-y-8">
                {steps.map((step, idx) => {
                  const isCurrent = idx === activeIndex;
                  const isDone = idx < activeIndex;
                  const isActive = idx <= activeIndex;
                  return (
                    <div key={step} className="relative">
                      {/* Status dot */}
                      <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isCurrent ? "bg-gold-400 border-gold-400 scale-125 shadow-glow" :
                        isDone ? "bg-green-500 border-green-500" : "bg-black border-white/20"
                      }`}>
                        {isDone && <FaCheckCircle className="text-white text-[8px]" />}
                      </span>

                      <div className="flex flex-col">
                        <span className={`font-bold text-sm ${isActive ? "text-white" : "text-white/35"}`}>{step}</span>
                        {isCurrent && (
                          <motion.span layoutId="timeline-hint" className="text-xs text-gold-400/80 mt-0.5">
                            Current Stage
                          </motion.span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order items detail */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-lg">
              <h3 className="font-bold text-lg border-b border-white/10 pb-4 mb-4">Order Details</h3>
              
              <div className="text-xs text-white/50 space-y-1 mb-4">
                <p>Order ID: <span className="font-mono text-white/70">{order._id}</span></p>
                <p>Placed: <span className="text-white/70">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {order.items.map((item) => (
                  <div key={item._id || item.menuItem} className="flex justify-between items-start text-sm">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-bold text-white truncate">{item.name}</p>
                      <p className="text-xs text-white/40">
                        Qty: {item.quantity} {item.portionType !== "single" && `· ${item.portionType}`}
                      </p>
                    </div>
                    <span className="font-bold text-gold-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 my-4 pt-4 space-y-2 text-sm text-white/60">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>₹{order.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/5">
                  <span>Total Paid</span>
                  <span className="text-gold-400">₹{order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link to="/customer/menu" state={{ fromTracking: true }} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 text-center text-sm font-bold text-white hover:bg-white/10 transition-colors">
              Return to Menu <FaChevronRight size={12} />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
