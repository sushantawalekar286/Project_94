import { motion } from "framer-motion";
import { FaClock, FaLeaf, FaUtensils } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

const statuses = ["Pending", "Preparing", "Completed"];

export default function OrderCard({ order, onStatusChange }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-card backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold-400">Table {order.tableNumber}</p>
          <h2 className="mt-1 text-2xl font-black">Order #{String(order._id).slice(-6)}</h2>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-white/55">
        <FaClock className="text-gold-400" />
        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="mt-5 space-y-3">
        {order.items?.map((item) => (
          <div key={`${order._id}-${item.name}`} className="flex items-center justify-between rounded-2xl bg-black/30 p-3">
            <div className="flex items-center gap-3">
              <FaUtensils className="text-primary-400" />
              <span className="font-semibold">{item.name}</span>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">x{item.quantity}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-green-300/10 bg-green-400/5 p-3 text-sm text-green-200">
        <FaLeaf className="mr-2 inline" />
        Required ingredients are deducted from inventory when the order is completed.
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            disabled={order.status === status}
            onClick={() => onStatusChange(order._id, status)}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/80 hover:border-gold-400/40 hover:text-gold-400 disabled:opacity-40"
          >
            {status}
          </button>
        ))}
      </div>
    </motion.article>
  );
}
