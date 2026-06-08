import { motion } from "framer-motion";
import { FaClock, FaUtensils, FaCheckCircle, FaBan, FaInfoCircle, FaClipboard } from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import toast from "react-hot-toast";

export default function OrderCard({ order, onStatusChange }) {
  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id);
    toast.success("Order ID copied to clipboard!");
  };

  const getActionButtons = () => {
    switch (order.status) {
      case "Pending":
        return (
          <>
            <button
              onClick={() => onStatusChange(order._id, "Accepted")}
              className="flex-1 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-900/10 active:scale-95 transition-all hover:bg-blue-500"
            >
              Accept Order
            </button>
            <button
              onClick={() => onStatusChange(order._id, "Cooking")}
              className="flex-1 rounded-2xl bg-orange-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-900/10 active:scale-95 transition-all hover:bg-orange-500"
            >
              Start Preparing
            </button>
            <button
              onClick={() => onStatusChange(order._id, "Cancelled")}
              className="rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-100 transition"
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
              className="flex-1 rounded-2xl bg-orange-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-900/10 active:scale-95 transition-all hover:bg-orange-500"
            >
              Start Preparing
            </button>
            <button
              onClick={() => onStatusChange(order._id, "Cancelled")}
              className="rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-100 transition"
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
            className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-900/10 active:scale-95 transition-all hover:bg-indigo-500"
          >
            Mark Ready
          </button>
        );
      case "Ready":
        return (
          <button
            onClick={() => onStatusChange(order._id, "Served")}
            className="w-full rounded-2xl bg-green-600 py-3 text-xs font-bold text-white shadow-lg shadow-green-900/10 active:scale-95 transition-all hover:bg-green-50"
          >
            Mark Served
          </button>
        );
      case "Served":
        return (
          <button
            onClick={() => onStatusChange(order._id, "Completed")}
            className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-900/10 active:scale-95 transition-all hover:bg-emerald-500"
          >
            Complete Order
          </button>
        );
      default:
        return (
          <div className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-neutral-400 bg-neutral-50 rounded-2xl border border-neutral-150">
            <FaCheckCircle className="text-emerald-500" /> Finished ({order.status})
          </div>
        );
    }
  };

  return (
    <motion.article 
      layout 
      initial={{ opacity: 0, y: 14 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">Table {order.tableNumber}</p>
            <h2 
              onClick={copyOrderId} 
              className="mt-1 text-sm font-mono font-bold text-neutral-500 flex items-center gap-1.5 cursor-pointer hover:text-neutral-800 transition"
              title="Click to copy full Order ID"
            >
              ID: {order._id} <FaClipboard size={10} className="opacity-50" />
            </h2>
          </div>
          <StatusBadge status={order.status} />
        </div>
        
        {/* Order Time */}
        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500 font-semibold">
          <FaClock className="text-red-500" size={12} />
          <span>Placed at: {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        {/* Customer Notes */}
        <div className="mt-3 rounded-2xl bg-amber-50/50 border border-amber-100 p-3 text-xs">
          <p className="font-black text-amber-800 flex items-center gap-1.5">
            <FaInfoCircle size={11} /> Customer Notes:
          </p>
          <p className="mt-1 text-neutral-600 italic font-semibold">
            {order.specialInstructions || "None"}
          </p>
        </div>

        {/* Items List */}
        <div className="mt-4 space-y-2">
          {order.items?.map((item, idx) => (
            <div key={`${order._id}-${item.name}-${item.portionType || idx}`} className="flex items-center justify-between rounded-xl bg-neutral-50 border border-neutral-100 p-3 text-xs">
              <div className="flex items-center gap-2.5">
                <FaUtensils className="text-red-500" size={11} />
                <div className="flex flex-col">
                  <span className="font-bold text-neutral-800">
                    {item.name} {item.portionType && item.portionType !== 'single' ? `(${item.portionType})` : ''}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold">
                    ₹{item.price?.toFixed(2)} each
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-neutral-200/50 px-2.5 py-1 text-[10px] font-black text-neutral-700">x{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Financial Details */}
        <div className="border-t border-neutral-100 mt-4 pt-4 space-y-1.5 text-xs text-neutral-500 font-bold">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-neutral-800">₹{order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="text-neutral-800">₹{order.tax?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between">
            <span>Discounts</span>
            <span className="text-neutral-800">₹0.00</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-2 text-sm font-black">
            <span className="text-neutral-800">Grand Total</span>
            <span className="text-red-600">₹{order.total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
          <span className="font-bold text-neutral-400">Payment Status</span>
          <span className={`px-2.5 py-0.5 rounded-full font-black border text-[9px] uppercase tracking-wider ${
            order.paymentStatus === "paid" 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : order.paymentStatus === "cancelled"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex gap-2.5">
        {getActionButtons()}
      </div>
    </motion.article>
  );
}
