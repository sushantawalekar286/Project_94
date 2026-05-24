import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaShoppingBag, FaSearch, FaConciergeBell, FaUtensils } from "react-icons/fa";
import { getMenu } from "../../services/menuService";
import { useCart } from "../../hooks/useCart";
import CategoryList from "../../components/menu/CategoryList";
import MenuCard from "../../components/menu/MenuCard";
import { getActiveOrderByTable } from "../../services/orderService";

const fallbackCategories = ["Pizza", "Burgers", "Fries", "Beverages"];
const fallbackImages = {
  Pizza: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  Fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
  Beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80"
};

const fallbackMenu = fallbackCategories.flatMap((category, categoryIndex) =>
  [1, 2, 3].map((count) => ({
    _id: `${category}-${count}`,
    name: `${category === "Fries" ? "Loaded" : "Signature"} ${category} ${count}`,
    description: "Chef curated flavors with premium ingredients and a polished restaurant finish.",
    pricingType: count === 2 ? "half-full" : "single",
    singlePrice: 129 + categoryIndex * 70 + count * 35,
    halfPrice: 99 + categoryIndex * 40 + count * 20,
    fullPrice: 149 + categoryIndex * 75 + count * 40,
    price: 129 + categoryIndex * 70 + count * 35,
    rating: 4.6 + count / 10,
    imageUrl: fallbackImages[category],
    category: { name: category }
  }))
);

const MenuSkeleton = () => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 h-[380px] flex flex-col justify-between">
        <div className="h-48 w-full bg-white/5 rounded-2xl" />
        <div className="space-y-3 mt-4">
          <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
          <div className="h-4 w-full bg-white/5 rounded-lg" />
          <div className="h-4 w-5/6 bg-white/5 rounded-lg" />
        </div>
        <div className="flex gap-3 mt-4">
          <div className="h-10 w-24 bg-white/5 rounded-xl" />
          <div className="h-10 flex-1 bg-white/10 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const { tableId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, items: cartItems, tableSession, setTableSession } = useCart();

  const tableParam = params.get("table");
  const tokenParam = params.get("token");
  const qrIdParam = params.get("qrId");
  const scannerIdParam = params.get("scannerId");

  useEffect(() => {
    const routeTableNumber = Number(tableId || tableParam || tableSession.tableNumber || 1);
    const token = tokenParam || tableSession.token || "";
    const qrId = qrIdParam || tableSession.qrId || "";
    const scannerId = scannerIdParam || tableSession.scannerId || "";

    if (!Number.isInteger(routeTableNumber) || routeTableNumber < 1) {
      toast.error("Invalid table QR code");
      navigate("/scan", { replace: true });
      return;
    }

    if (
      routeTableNumber !== tableSession.tableNumber ||
      token !== tableSession.token ||
      qrId !== tableSession.qrId ||
      scannerId !== tableSession.scannerId
    ) {
      console.log("[LOADING STATE] Updating table session to Table:", routeTableNumber);
      setTableSession({ tableNumber: routeTableNumber, token, qrId, scannerId });
    }
  }, [tableId, tableParam, tokenParam, qrIdParam, scannerIdParam, navigate, setTableSession, tableSession.tableNumber, tableSession.token, tableSession.qrId, tableSession.scannerId]);

  useEffect(() => {
    getMenu()
      .then((res) => setItems(res.data?.length ? res.data : fallbackMenu))
      .catch(() => setItems(fallbackMenu))
      .finally(() => setLoading(false));
  }, []);

  // Check active order status for the table
  useEffect(() => {
    const tableNum = tableId || tableParam || tableSession.tableNumber;
    if (tableNum) {
      getActiveOrderByTable(tableNum)
        .then((res) => {
          if (res.data?.active && res.data?.order) {
            setHasActiveOrder(true);
            localStorage.setItem("activeOrderId", res.data.order._id);
            localStorage.setItem("tableNumber", String(tableNum));
            
            // Redirect customer if they are not explicitly coming back from the tracking screen
            if (!location.state?.fromTracking) {
              navigate("/customer/tracking", { state: { order: res.data.order } });
            }
          } else {
            setHasActiveOrder(false);
          }
        })
        .catch((err) => {
          console.error("Error checking active order:", err);
        });
    }
  }, [tableId, tableParam, tableSession.tableNumber, location.state, navigate]);

  const categories = useMemo(() => {
    const names = [...new Set(items.map((item) => item.category?.name).filter(Boolean))];
    const baseCategories = names.length ? names : fallbackCategories;
    return [{ name: "All" }, ...baseCategories.map((name) => ({ name }))];
  }, [items]);

  const filtered = items.filter((item) => {
    const matchesCategory = category === "All" || item.category?.name === category;
    const matchesSearch = `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="min-h-screen bg-black px-4 pb-28 pt-5 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="sticky top-0 z-20 -mx-4 border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold-400">Aurum Bistro</p>
              <h1 className="text-2xl font-black sm:text-4xl">Digital Menu</h1>
            </div>
            <button
              onClick={() => navigate(`/customer/cart?table=${tableSession.tableNumber}`)}
              className="relative grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-gold-500 text-white shadow-glow"
            >
              <FaShoppingBag />
              {cartItems.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-black">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <FaSearch className="text-gold-400" />
              <input
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pizza, burgers, fries, beverages"
              />
            </label>
            <div className="rounded-2xl border border-gold-400/20 bg-gold-400/10 px-4 py-3 text-sm font-bold text-gold-400">
              Table {tableSession.tableNumber}
            </div>
          </div>
        </header>

        <div className="mt-6">
          <CategoryList categories={categories} active={category} onSelect={setCategory} />
        </div>

        {loading ? (
          <MenuSkeleton />
        ) : (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full py-16 text-center text-white/45 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 p-10 max-w-md mx-auto mt-6">
                <FaUtensils className="mx-auto text-4xl text-white/30 mb-3" />
                <p className="font-bold text-white">No items found</p>
                <p className="text-xs text-white/40 mt-1">We couldn't find any dishes matching "{search}" or under category "{category}".</p>
              </div>
            ) : (
              filtered.map((item, index) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  index={index}
                  onAdd={(selected, quantity, portionType, price) => {
                    addItem({
                      menuItem: selected._id,
                      name: selected.name,
                      price,
                      quantity,
                      imageUrl: selected.imageUrl,
                      portionType
                    });
                    toast.success(`${selected.name} added to cart`);
                  }}
                />
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Actions Container */}
      <AnimatePresence>
        {(cartItems.length > 0 || hasActiveOrder) && (
          <motion.div 
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-1/2 z-50 flex gap-4 w-[calc(100%-2rem)] max-w-md"
          >
            {cartItems.length > 0 && (
              <button
                onClick={() => navigate(`/customer/cart?table=${tableSession.tableNumber}`)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-gold-500 py-4 font-black text-white shadow-glow text-sm transition-transform active:scale-95"
              >
                <FaShoppingBag />
                <span>View Cart ({cartItems.length})</span>
              </button>
            )}

            {hasActiveOrder && (
              <button
                onClick={() => navigate("/customer/tracking")}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 border border-white/10 hover:bg-neutral-800 py-4 font-black text-gold-400 shadow-xl text-sm transition-transform active:scale-95"
              >
                <FaConciergeBell className="animate-pulse" />
                <span>Track Order</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
