import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheck, FaClock, FaConciergeBell } from "react-icons/fa";

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <section className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(230,77,44,.18),transparent_32%)]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-glow backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 8, -8, 0] }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-4xl text-white shadow-glow"
        >
          <FaCheck />
        </motion.div>
        <h1 className="mt-7 text-4xl font-black">Order Sent to Chef</h1>
        <p className="mt-3 text-white/65">Your food is now in the chef panel with Pending status.</p>

        <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-2xl bg-black/30 p-4">
            <FaConciergeBell className="mb-3 text-gold-400" />
            <p className="text-xs text-white/45">Order Number</p>
            <p className="truncate font-bold">{order?._id || "Processing"}</p>
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <FaClock className="mb-3 text-gold-400" />
            <p className="text-xs text-white/45">Estimated Time</p>
            <p className="font-bold">18-25 minutes</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="btn-primary flex-1" to="/customer/menu">Back to Menu</Link>
          <Link className="btn-secondary flex-1" to="/customer/tracking" state={{ order }}>Track Status</Link>
        </div>
      </motion.div>
    </section>
  );
}
