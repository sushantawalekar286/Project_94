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
  const tax = Number((total * 0.08).toFixed(2));
  const grandTotal = Number((total + tax).toFixed(2));

  const checkout = async () => {
    if (!items.length) return toast.error("Your cart is empty");
    if (!tableSession?.tableNumber) return toast.error("Please scan your table QR code before placing an order.");
    setPlacing(true);
    try {
      const res = await placeOrder({
        tableNumber: tableSession.tableNumber,
        token: tableSession.token,
        items: items.map(({ menuItem, quantity }) => ({ menuItem, quantity }))
      });
      clearCart();
      navigate("/customer/success", { state: { order: res.data } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="min-h-screen bg-black px-4 py-5 text-white sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm text-white/60 hover:text-gold-400">
            <FaArrowLeft /> Back to menu
          </button>
          <h1 className="text-4xl font-black">Your Cart</h1>
          <p className="mt-2 text-white/55">Table {tableSession.tableNumber} order summary</p>

          <div className="mt-6 space-y-4">
            <AnimatePresence>
              {items.length ? (
                items.map((item) => (
                  <motion.div
                    key={item.menuItem}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-card backdrop-blur"
                  >
                    <img className="h-24 w-24 rounded-2xl object-cover" src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"} alt={item.name} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-bold">{item.name}</h2>
                      <p className="mt-1 text-gold-400">₹{item.price}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-white/10 bg-black/30">
                          <button className="p-3" onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}><FaMinus size={12} /></button>
                          <span className="min-w-8 text-center font-bold">{item.quantity}</span>
                          <button className="p-3" onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}><FaPlus size={12} /></button>
                        </div>
                        <button className="rounded-full p-3 text-red-300 hover:bg-red-500/10" onClick={() => removeItem(item.menuItem)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-10 text-center">
                  <FaReceipt className="mx-auto text-5xl text-gold-400" />
                  <h2 className="mt-5 text-2xl font-black">Your cart is empty</h2>
                  <p className="mt-2 text-white/55">Add a few restaurant favorites before checkout.</p>
                  <Button className="mx-auto mt-6" onClick={() => navigate(`/table/${tableSession.tableNumber}`)}>Browse Menu</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="h-max rounded-3xl border border-gold-400/20 bg-gradient-to-b from-white/10 to-white/[0.04] p-6 shadow-glow backdrop-blur-xl lg:sticky lg:top-6">
          <p className="text-sm uppercase tracking-[0.22em] text-gold-400">Order Summary</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-white/65"><span>Table</span><span className="font-bold text-white">{tableSession.tableNumber}</span></div>
            <div className="flex justify-between text-white/65"><span>Items</span><span>{items.length}</span></div>
            <div className="flex justify-between text-white/65"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
            <div className="flex justify-between text-white/65"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
          </div>
          <div className="my-5 h-px bg-white/10" />
          <div className="flex items-center justify-between text-2xl font-black">
            <span>Total</span>
            <motion.span key={grandTotal} initial={{ scale: 0.85 }} animate={{ scale: 1 }}>₹{grandTotal.toFixed(2)}</motion.span>
          </div>
          <Button className="mt-6 w-full" loading={placing} onClick={checkout}>Place Order</Button>
        </aside>
      </div>
    </section>
  );
}
