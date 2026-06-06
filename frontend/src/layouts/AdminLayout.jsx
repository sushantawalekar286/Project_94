import { NavLink } from "react-router-dom";
import { FaChartPie, FaClipboardList, FaMoneyBillWave, FaQrcode, FaUtensils, FaSignOutAlt, FaUserShield } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const links = [
  ["/admin", "Dashboard", FaChartPie],
  ["/admin/menu", "Menu", FaUtensils],
  ["/admin/expenses", "Expenses", FaMoneyBillWave],
  ["/admin/orders", "Orders", FaClipboardList],
  ["/admin/qr", "QR Codes", FaQrcode]
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-800 lg:grid lg:grid-cols-[260px_1fr] font-sans antialiased">
      <aside className="border-b border-neutral-200/60 bg-white p-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-6 shadow-[2px_0_12px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col items-center text-center gap-2 border-b border-neutral-100 pb-5 pt-2 w-full">
          <img src="/logo.png" alt="94 Cafe & Chinese" className="h-16 w-16 rounded-2xl object-cover shadow-md border border-neutral-100 bg-white" />
          <div className="mt-1">
            <h1 className="text-base font-black text-neutral-800 tracking-tight leading-none">94 Cafe & Chinese</h1>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600 mt-1 block">Admin Portal</span>
          </div>
        </div>
        <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm" 
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                }`
              }
            >
              <Icon /> {label}
            </NavLink>
          ))}
          <button 
            onClick={logout}
            className="mt-auto flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 hover:text-red-700 lg:mt-5"
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>
      <main className="min-h-screen relative">{children}</main>
    </div>
  );
}
