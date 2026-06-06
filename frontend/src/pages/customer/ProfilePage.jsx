import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaChair, FaHistory, FaCheckCircle, FaChevronRight, FaSignOutAlt, FaInfoCircle, FaHeart, FaChevronDown } from "react-icons/fa";
import { useCart } from "../../hooks/useCart";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { tableSession, setTableSession, clearCart } = useCart();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(() => localStorage.getItem("diningUserName") || "Dining Guest");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [orderHistory, setOrderHistory] = useState([]);
  const [vegOnly, setVegOnly] = useState(() => localStorage.getItem("prefVegOnly") === "true");
  const [spicyLevel, setSpicyLevel] = useState(() => localStorage.getItem("prefSpicyLevel") || "Medium");

  useEffect(() => {
    // Load local order history
    const history = JSON.parse(localStorage.getItem("customerOrderHistory") || "[]");
    setOrderHistory(history);
  }, []);

  const saveName = () => {
    if (!tempName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setUserName(tempName);
    localStorage.setItem("diningUserName", tempName);
    setIsEditingName(false);
    toast.success("Name updated");
  };

  const toggleVegOnly = (checked) => {
    setVegOnly(checked);
    localStorage.setItem("prefVegOnly", String(checked));
    toast.success(checked ? "Veg-only filter activated" : "Veg-only filter deactivated");
  };

  const handleSpicyChange = (e) => {
    const val = e.target.value;
    setSpicyLevel(val);
    localStorage.setItem("prefSpicyLevel", val);
  };

  const handleResetSession = () => {
    if (window.confirm("Are you sure you want to end this table session? This will clear your current cart and active table configuration.")) {
      clearCart();
      localStorage.removeItem("customerOrderHistory");
      localStorage.removeItem("activeOrderId");
      localStorage.removeItem("tableNumber");
      setTableSession({ tableNumber: 1, token: "", qrId: "", scannerId: "" });
      toast.success("Session reset. Redirecting to QR Scan page.");
      navigate("/scan");
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF9F6] text-neutral-800 px-4 py-6 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center pt-4">
          <div className="relative mx-auto w-24 h-24 rounded-full bg-neutral-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
            <FaUser className="text-neutral-400 text-5xl" />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            {isEditingName ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-3 py-1 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-red-500 bg-white"
                  maxLength={25}
                  autoFocus
                />
                <button
                  onClick={saveName}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTempName(userName);
                    setIsEditingName(false);
                  }}
                  className="text-neutral-400 text-xs px-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-black text-neutral-800">{userName}</h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Dining Session at 94 Cafe & Chinese</p>
        </div>

        {/* Table Session Details */}
        <div className="rounded-3xl bg-white border border-neutral-100 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-800 flex items-center gap-2">
            <FaChair className="text-red-500" /> Current Table Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
              <span className="text-xs text-neutral-400 block">Table Number</span>
              <span className="text-xl font-extrabold text-neutral-800">{tableSession.tableNumber || 1}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
              <span className="text-xs text-neutral-400 block">QR Status</span>
              <span className="text-sm font-bold text-green-600 block mt-1">Detected</span>
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 bg-neutral-50 p-2.5 rounded-xl break-all">
            <span className="font-bold text-neutral-500">Session Token:</span> {tableSession.token || "No active credentials - local sandbox"}
          </div>
        </div>

        {/* Preferences / Dining Settings */}
        <div className="rounded-3xl bg-white border border-neutral-100 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-800 flex items-center gap-2">
            <FaHeart className="text-red-500" /> Dietary Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-semibold text-neutral-800">Vegetarian Only</p>
                <p className="text-xs text-neutral-400">Show only veg options in menu</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => toggleVegOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-1 border-t border-neutral-100 pt-3">
              <div>
                <p className="text-sm font-semibold text-neutral-800">Spicy Preference</p>
                <p className="text-xs text-neutral-400">Preferred spice levels</p>
              </div>
              <select
                value={spicyLevel}
                onChange={handleSpicyChange}
                className="text-xs font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Mild">Mild 🌶️</option>
                <option value="Medium">Medium 🌶️🌶️</option>
                <option value="Hot">Spicy 🌶️🌶️🌶️</option>
              </select>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="rounded-3xl bg-white border border-neutral-100 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-800 flex items-center gap-2">
            <FaHistory className="text-red-500" /> Order History ({orderHistory.length})
          </h2>
          
          <div className="space-y-3">
            {orderHistory.length === 0 ? (
              <div className="text-center py-6 text-neutral-400">
                <FaInfoCircle className="mx-auto text-2xl text-neutral-300 mb-2" />
                <p className="text-xs">No orders placed from this browser session yet.</p>
              </div>
            ) : (
              orderHistory.map((order, idx) => (
                <div key={order._id || idx} className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 flex justify-between items-center text-sm">
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-800 truncate">Order #{order._id?.substring(order._id.length - 6).toUpperCase()}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {order.items?.length || 0} items · ₹{order.total?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200">
                      {order.status || "Placed"}
                    </span>
                    <button
                      onClick={() => navigate("/customer/tracking", { state: { order } })}
                      className="p-2 text-neutral-400 hover:text-red-500 rounded-full hover:bg-neutral-100"
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reset / Leave Table */}
        <button
          onClick={handleResetSession}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white border border-red-200 py-4 text-center text-sm font-bold text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-200 shadow-sm"
        >
          <FaSignOutAlt /> End Dining Session
        </button>

      </div>
    </section>
  );
}
