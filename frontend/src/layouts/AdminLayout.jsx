import { NavLink } from "react-router-dom";
import { FaChartPie, FaClipboardList, FaQrcode, FaUtensils, FaWarehouse, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const links = [
  ["/admin", "Dashboard", FaChartPie],
  ["/admin/menu", "Menu", FaUtensils],
  ["/admin/inventory", "Inventory", FaWarehouse],
  ["/admin/orders", "Orders", FaClipboardList],
  ["/admin/qr", "QR Codes", FaQrcode]
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-black text-white lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/10 bg-[#0b0b0b] p-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-6">
        <h1 className="text-xl font-black text-gold-400">Digital Waiter</h1>
        <nav className="mt-5 flex gap-2 overflow-x-auto lg:flex-col">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive ? "bg-gradient-to-r from-primary-500 to-gold-500 text-white shadow-glow" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon /> {label}
            </NavLink>
          ))}
          <button 
            onClick={logout}
            className="mt-auto flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 lg:mt-5"
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
