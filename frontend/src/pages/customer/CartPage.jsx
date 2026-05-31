import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaArrowLeft, FaMinus, FaPlus, FaReceipt, FaTrash } from "react-icons/fa";
import { placeOrder } from "../../services/orderService";
import { useCart } from "../../hooks/useCart";
import Button from "../../components/common/Button";

export default function CartPage() {
  const { items, total, tableSession, updateQuantity, removeItem, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const grandTotal = Number(total.toFixed(2));

  const checkout = async () => {
    if (!items.length) return toast.error("Your cart is empty");
    if (!tableSession?.tableNumber) return toast.error("Please scan your table QR code before placing an order.");
    console.log("[LOADING STATE] CartPage placing: true");
    setPlacing(true);
    try {
      const res = await placeOrder({
        tableNumber: tableSession.tableNumber,
        token: tableSession.token,
        items: items.map(({ menuItem, quantity, portionType }) => ({ menuItem, quantity, portionType }))
      });
      const orderData = res.data?.order || res.data;
      if (orderData?._id) {
        localStorage.setItem("activeOrderId", orderData._id);
        localStorage.setItem("tableNumber", String(tableSession.tableNumber));
        
        // Append to local order history
        try {
          const history = JSON.parse(localStorage.getItem("customerOrderHistory") || "[]");
          if (!history.some(h => h._id === orderData._id)) {
            // Save basic order details to display on profile page
            history.push({
              _id: orderData._id,
              createdAt: orderData.createdAt || new Date().toISOString(),
              total: orderData.total || grandTotal,
              status: orderData.status || "Pending",
              items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, portionType: i.portionType }))
            });
            localStorage.setItem("customerOrderHistory", JSON.stringify(history));
          }
        } catch (e) {
          console.error("Failed to write to customerOrderHistory", e);
        }
      }
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/customer/success", { state: { order: orderData } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to place order");
    } finally {
      console.log("[LOADING STATE] CartPage placing: false");
      setPlacing(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF9F6] px-4 py-5 text-neutral-800 pb-10">
      <div className="mx-auto max-w-lg space-y-6">
        
        {/* Header */}
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-red-600 transition-colors"
          >
            <FaArrowLeft /> BACK TO MENU
          </button>
          <h1 className="text-2xl font-black text-neutral-800 tracking-tight">Your Cart</h1>
          <p className="text-xs text-neutral-400 mt-1">Table {tableSession.tableNumber || 1} Order Summary</p>
        </div>

        {/* Cart Items List */}
        <div className="space-y-3">
          <AnimatePresence>
            {items.length ? (
              items.map((item) => (
                <motion.div
                  key={`${item.menuItem}-${item.portionType || "single"}`}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 rounded-3xl bg-white border border-neutral-100 p-4 shadow-sm"
                >
                  <img 
                    className="h-20 w-20 rounded-2xl object-cover border border-neutral-100 flex-shrink-0" 
                    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                  
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="truncate text-sm sm:text-base font-black text-neutral-800">{item.name}</h2>
                      <p className="text-xs font-extrabold text-red-600 mt-0.5">
                        ₹{item.price}{item.portionType && item.portionType !== "single" ? ` · ${item.portionType}` : ""}
                      </p>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-xl bg-white border border-red-600 text-red-600 font-extrabold text-xs h-7.5 shadow-sm overflow-hidden">
                        <button 
                          className="w-7 h-full flex items-center justify-center hover:bg-red-50 text-red-600 active:scale-90" 
                          onClick={() => updateQuantity(item.menuItem, item.quantity - 1, item.portionType)}
                        >
                          <FaMinus size={8} />
                        </button>
                        <span className="w-8 text-center text-red-600 select-none font-black text-xs">{item.quantity}</span>
                        <button 
                          className="w-7 h-full flex items-center justify-center hover:bg-red-50 text-red-600 active:scale-90" 
                          onClick={() => updateQuantity(item.menuItem, item.quantity + 1, item.portionType)}
                        >
                          <FaPlus size={8} />
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button 
                        className="rounded-full p-2 text-neutral-400 hover:text-red-600 hover:bg-neutral-50 transition-colors" 
                        onClick={() => removeItem(item.menuItem, item.portionType)}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="rounded-3xl border border-dashed border-neutral-200 bg-white p-8 text-center"
              >
                <FaReceipt className="mx-auto text-4xl text-neutral-300" />
                <h2 className="mt-4 text-lg font-black text-neutral-800">Your cart is empty</h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-normal">
                  You haven't added any dishes to your order yet.
                </p>
                <button 
                  className="mt-5 rounded-2xl bg-red-600 text-white text-xs font-black px-6 py-2.5 shadow-sm hover:bg-red-700 active:scale-95 transition-all"
                  onClick={() => navigate(`/table/${tableSession.tableNumber || 1}`)}
                >
                  Browse Menu
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pricing Summary */}
        {items.length > 0 && (
          <aside className="rounded-3xl bg-white border border-neutral-100 p-5 shadow-sm space-y-4">
            <p className="text-xs font-black uppercase tracking-wider text-red-600">Order Summary</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Table</span>
                <span className="font-bold text-neutral-800">{tableSession.tableNumber || 1}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Items Selected</span>
                <span className="font-bold text-neutral-800">{items.length}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-800">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="h-px bg-neutral-100" />
            <div className="flex items-center justify-between text-lg font-black text-neutral-800">
              <span>Grand Total</span>
              <motion.span key={grandTotal} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-red-600">
                ₹{grandTotal.toFixed(2)}
              </motion.span>
            </div>
            
            <button 
              disabled={placing}
              onClick={checkout}
              className="w-full mt-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-3.5 font-black text-white shadow-md text-xs transition-all duration-150 active:scale-95 disabled:opacity-55 uppercase tracking-wider text-center"
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}
