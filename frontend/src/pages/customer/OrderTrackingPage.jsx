import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";

const steps = ["Pending", "Preparing", "Completed"];

export default function OrderTrackingPage() {
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order || null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !order?._id) return;
    socket.emit("join:order", order._id);
    socket.on("order:updated", setOrder);
    return () => socket.off("order:updated", setOrder);
  }, [socket, order?._id]);

  const activeIndex = Math.max(0, steps.indexOf(order?.status || "Pending"));

  return (
    <section className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.22em] text-gold-400">Live Tracking</p>
        <h1 className="mt-2 text-4xl font-black">Order Status</h1>
        <p className="mt-2 text-white/55">{order?._id ? `Order ${order._id}` : "Open this page from your order success screen for live updates."}</p>
        <div className="mt-8 space-y-4">
          {steps.map((step, index) => (
            <div key={step} className={`rounded-2xl border p-5 ${index <= activeIndex ? "border-gold-400/40 bg-gold-400/10" : "border-white/10 bg-white/[0.03]"}`}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{step}</span>
                <span className="text-sm text-white/55">{index <= activeIndex ? "Active" : "Waiting"}</span>
              </div>
            </div>
          ))}
        </div>
        <Link className="btn-primary mt-8 inline-flex" to="/customer/menu">Back to Menu</Link>
      </div>
    </section>
  );
}
