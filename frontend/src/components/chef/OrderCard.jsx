import { motion } from "framer-motion";
import { FaClock, FaUtensils, FaCheckCircle, FaBan } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

export default function OrderCard({ order, onStatusChange }) {
  const getActionButtons = () => {
    switch (order.status) {
      case "Pending":
        return (
          <>
            <button
              onClick={() => onStatusChange(order._id, "Accepted")}
              className="flex-1 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-transform hover:bg-blue-500"
            >
              Accept Order
            </button>
            <button
              onClick={() => onStatusChange(order._id, "Cancelled")}
              className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-400 active:scale-95 transition-transform hover:bg-red-500/20"
              title="Cancel Order"
            >
              <FaBan />
            </button>
          </>
        );
      case "Accepted":
        return (
          <>
            <button
              onClick={() => onStatusChange(order._id, "Cooking")}
              className="flex-1 rounded-2xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/20 active:scale-95 transition-transform hover:bg-orange-500"
            >
              Start Cooking
            </button>
            <button
              onClick={() => onStatusChange(order._id, "Cancelled")}
              className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-400 active:scale-95 transition-transform hover:bg-red-500/20"
              title="Cancel Order"
            >
              <FaBan />
            </button>
          </>
        );
      case "Cooking":
        return (
          <button
            onClick={() => onStatusChange(order._id, "Ready")}
            className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 active:scale-95 transition-transform hover:bg-indigo-500"
          >
            Mark Ready
          </button>
        );
      case "Ready":
        return (
          <button
            onClick={() => onStatusChange(order._id, "Served")}
            className="w-full rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/20 active:scale-95 transition-transform hover:bg-green-500"
          >
            Mark Served
          </button>
        );
      case "Served":
        return (
          <button
            onClick={() => onStatusChange(order._id, "Completed")}
            className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform hover:bg-emerald-500"
          >
            Complete Order
          </button>
        );
      default:
        return (
          <div className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-neutral-400 bg-neutral-50 rounded-2xl border border-neutral-200">
            <FaCheckCircle className="text-emerald-500" /> Finished
          </div>
        );
    }
  };

  return (
    <motion.article 
      layout 
      initial={{ opacity: 0, y: 14 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">Table {order.tableNumber}</p>
          <h2 className="mt-1 text-2xl font-black text-neutral-800">Order #{String(order._id).slice(-6)}</h2>
        </div>
        <StatusBadge status={order.status} />
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 font-semibold">
        <FaClock className="text-red-600" />
        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>

      <div className="mt-5 space-y-3">
        {order.items?.map((item, idx) => (
          <div key={`${order._id}-${item.name}-${item.portionType || idx}`} className="flex items-center justify-between rounded-2xl bg-neutral-50 border border-neutral-100 p-4">
            <div className="flex items-center gap-3">
              <FaUtensils className="text-red-600" />
              <span className="font-bold text-neutral-800">{item.name} {item.portionType && item.portionType !== 'single' ? `(${item.portionType})` : ''}</span>
            </div>
            <span className="rounded-full bg-neutral-200/50 px-3 py-1 text-xs font-black text-neutral-700">x{item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        {getActionButtons()}
      </div>
    </motion.article>
  );
}
