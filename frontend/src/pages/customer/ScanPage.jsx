import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaQrcode, FaUtensils, FaChair } from "react-icons/fa";
import Button from "../../components/common/Button";
import { useCart } from "../../hooks/useCart";

export default function ScanPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTableSession, tableSession } = useCart();

  const tableNumber = Number(params.get("table") || params.get("tableNumber") || tableSession.tableNumber || 1);
  const token = params.get("token") || tableSession.token || "";
  const qrId = params.get("qrId") || `QR-T${tableNumber}`;
  const scannerId = params.get("scannerId") || `SCANNER-T${tableNumber}`;

  useEffect(() => {
    setTableSession({ tableNumber, token, qrId, scannerId });
  }, [tableNumber, token, qrId, scannerId]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=80"
        alt="Fine dining restaurant table"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-gold-400/30 bg-white/10 px-4 py-2 text-sm text-gold-400 backdrop-blur-md">
            <FaQrcode />
            QR Code Digital Waiter System
          </div>
          <h1 className="text-5xl font-black leading-tight sm:text-7xl">
            Welcome to <span className="text-gold-400">Aurum Bistro</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/75">
            Your table has been detected. Browse the menu, add your favorites, and send the order directly to the chef.
          </p>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              ["Table", tableNumber, <FaChair key="chair" />],
              ["QR ID", qrId, <FaQrcode key="qr" />],
              ["Scanner", scannerId, <FaUtensils key="scan" />]
            ].map(([label, value, icon]) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <div className="mb-2 text-gold-400">{icon}</div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">{label}</p>
                <p className="mt-1 truncate text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => navigate(`/customer/menu?table=${tableNumber}&token=${token}`)}>
              View Menu
            </Button>
            <Button variant="secondary" onClick={() => navigate("/login")}>
              Staff Login
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
