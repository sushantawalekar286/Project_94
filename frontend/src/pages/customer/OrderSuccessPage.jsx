import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheck, FaClock, FaConciergeBell } from "react-icons/fa";

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <section className="min-h-screen bg-[#FAF9F6] px-5 py-12 flex flex-col items-center justify-center text-neutral-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl bg-white border border-neutral-100 p-6 text-center shadow-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 8, -8, 0] }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white shadow-sm"
        >
          <FaCheck />
        </motion.div>
        
        <h1 className="mt-6 text-2xl font-black text-neutral-800 tracking-tight">Order Sent to Chef</h1>
        <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
          Your order has been received at the kitchen and is currently in queue.
        </p>

        <div className="mt-6 grid gap-3 text-left grid-cols-2">
          <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4">
            <FaConciergeBell className="mb-2 text-red-600 text-lg" />
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Order No</p>
            <p className="truncate text-xs font-black text-neutral-800 mt-0.5">
              #{order?._id?.substring(order._id.length - 6).toUpperCase() || "NEW"}
            </p>
          </div>
          
          <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4">
            <FaClock className="mb-2 text-red-600 text-lg" />
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Est. Time</p>
            <p className="text-xs font-black text-neutral-800 mt-0.5">15-20 mins</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2.5">
          <Link 
            className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-3 font-black text-white shadow-md text-xs transition-transform active:scale-95 uppercase tracking-wider text-center" 
            to="/customer/menu"
          >
            Back to Menu
          </Link>
          <Link 
            className="w-full rounded-2xl bg-white border border-neutral-200 py-3 font-bold text-neutral-600 hover:bg-neutral-50 transition-transform active:scale-95 text-xs uppercase tracking-wider text-center" 
            to="/customer/tracking" 
            state={{ order }}
          >
            Track Status
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
