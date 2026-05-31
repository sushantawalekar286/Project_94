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
  Pizza: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
  Fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80",
  Beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80"
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
    rating: (4.4 + count / 10).toFixed(1),
    imageUrl: fallbackImages[category],
    vegetarian: count % 2 !== 0,
    category: { name: category }
  }))
);

const MenuSkeleton = () => (
  <div className="space-y-4 px-4 py-2 animate-pulse bg-white">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex justify-between items-center gap-4 py-4 border-b border-neutral-100">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 bg-neutral-200 rounded" />
          <div className="h-5 w-3/4 bg-neutral-200 rounded" />
          <div className="h-3 w-5/6 bg-neutral-100 rounded" />
          <div className="h-3 w-1/2 bg-neutral-100 rounded" />
        </div>
        <div className="h-24 w-24 bg-neutral-200 rounded-2xl flex-shrink-0" />
      </div>
    ))}
  </div>
);

const SUPER_CATEGORIES = {
  "Cafe Menu": {
    title: "Cafe Menu",
    description: "Espresso, mocktails, burgers, pizzas, and light bites",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
    categories: [
      "Nuggets", "Burgers", "Fries", "Rolls", "Ice Cream", 
      "Cold Coffee", "Hot Coffee", "Milkshakes", "Sandwiches", 
      "Toasts", "Mocktails", "Special Pizzas", "Veg Pizzas", "Maggie",
      "Pizza", "Burgers", "Fries", "Beverages"
    ]
  },
  "Chinese Menu": {
    title: "Chinese Menu",
    description: "Delectable noodles, fried rice, momos, soups, and appetizers",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    categories: [
      "Momos", "Paneer Course (Rice)", "Paneer Course (Noodles)", 
      "Chicken Special", "Veg Soups", "Veg Chopsuey", "Non-Veg Soups", 
      "Non-Veg Chopsuey", "Non-Veg Course (Rice)", "Non-Veg Course (Noodles)"
    ]
  }
};

const getSuperCategoryForItem = (categoryName) => {
  if (!categoryName) return "Cafe Menu";
  for (const [key, value] of Object.entries(SUPER_CATEGORIES)) {
    if (value.categories.some(cat => cat.toLowerCase() === categoryName.toLowerCase())) {
      return key;
    }
  }
  
  const name = categoryName.toLowerCase();
  if (name.includes("momo") || name.includes("soup") || name.includes("chopsuey") || name.includes("noodle") || name.includes("rice") || name.includes("chicken")) {
    return "Chinese Menu";
  }
  
  return "Cafe Menu";
};

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState(
    sessionStorage.getItem("selectedMenuCategory") || ""
  );
  const { tableId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, tableSession, setTableSession } = useCart();

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
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setItems(data.length ? data : fallbackMenu);
      })
      .catch(() => setItems(fallbackMenu))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const tableNum = tableId || tableParam || tableSession.tableNumber;
    if (tableNum) {
      getActiveOrderByTable(tableNum)
        .then((res) => {
          if (res.data?.active && res.data?.order) {
            setHasActiveOrder(true);
            localStorage.setItem("activeOrderId", res.data.order._id);
            localStorage.setItem("tableNumber", String(tableNum));
            
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

  const menuItemsFilteredBySuper = useMemo(() => {
    return items.filter(item => {
      const superCat = getSuperCategoryForItem(item.category?.name);
      return superCat === selectedMenuCategory;
    });
  }, [items, selectedMenuCategory]);

  const categories = useMemo(() => {
    const names = [...new Set(menuItemsFilteredBySuper.map((item) => item.category?.name).filter(Boolean))];
    return [{ name: "All" }, ...names.map((name) => ({ name }))];
  }, [menuItemsFilteredBySuper]);

  // Apply dietary filter from profile page if checked
  const filtered = useMemo(() => {
    const isVegOnly = localStorage.getItem("prefVegOnly") === "true";
    return menuItemsFilteredBySuper.filter((item) => {
      const matchesCategory = category === "All" || item.category?.name === category;
      const matchesSearch = `${item.name} ${item.description || ""}`.toLowerCase().includes(search.toLowerCase());
      const matchesVeg = !isVegOnly || item.vegetarian === true;
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [menuItemsFilteredBySuper, category, search, localStorage.getItem("prefVegOnly")]);

  if (!selectedMenuCategory) {
    return (
      <section className="min-h-screen bg-[#FAF9F6] px-5 py-12 flex flex-col items-center justify-center text-neutral-800">
        <div className="w-full max-w-sm text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
            Aurum Bistro
          </span>
          <h1 className="text-3xl font-black mt-6 mb-2 text-neutral-800 tracking-tight">
            Select Your Menu
          </h1>
          <p className="text-neutral-500 text-xs max-w-xs mx-auto mb-10 leading-relaxed">
            Welcome to Table {tableSession.tableNumber || tableId || 1}. Choose a menu selection to explore our culinary options.
          </p>

          <div className="space-y-4">
            {Object.entries(SUPER_CATEGORIES).map(([key, config]) => (
              <motion.div
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sessionStorage.setItem("selectedMenuCategory", key);
                  setSelectedMenuCategory(key);
                }}
                className="relative cursor-pointer overflow-hidden rounded-3xl border border-neutral-100 bg-white p-5 text-left shadow-sm hover:border-red-200 transition-all duration-200 group h-52 flex flex-col justify-end"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                  style={{ backgroundImage: `url(${config.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

                <div className="relative z-10">
                  <h2 className="text-lg font-black text-neutral-800 group-hover:text-red-600 transition-colors">
                    {config.title}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500 leading-normal max-w-xs">
                    {config.description}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                    View Menu &rarr;
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white text-neutral-800">
      
      {/* Sticky header matching food-delivery apps */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="px-4 pt-4 pb-3">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600">Aurum Bistro</span>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-xl font-black text-neutral-800 leading-tight">Digital Menu</h1>
                <span className="rounded-full bg-neutral-100 border border-neutral-200/50 px-2.5 py-0.5 text-[9px] font-black text-neutral-600 uppercase tracking-wider">
                  {selectedMenuCategory.replace(" Menu", "")}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                sessionStorage.removeItem("selectedMenuCategory");
                setSelectedMenuCategory("");
                setCategory("All");
              }}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-black text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all"
            >
              Switch
            </button>
          </div>

          {/* Search bar inside header */}
          <div className="mt-3.5 flex gap-2">
            <label className="flex flex-1 items-center gap-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5">
              <FaSearch className="text-neutral-400 text-sm" />
              <input
                className="w-full bg-transparent text-xs text-neutral-800 outline-none placeholder:text-neutral-400 font-medium"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rolls, pizza, beverages, momos, noodles..."
              />
            </label>
            <div className="rounded-2xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-black text-red-600 flex items-center justify-center">
              Table {tableSession.tableNumber}
            </div>
          </div>

        </div>

        {/* Sticky horizontal category filter pills */}
        <div className="bg-white border-t border-neutral-50 py-1.5">
          <CategoryList categories={categories} active={category} onSelect={setCategory} />
        </div>
      </header>

      {/* Product List */}
      <div className="pb-20">
        {loading ? (
          <MenuSkeleton />
        ) : (
          <div className="px-4">
            {filtered.length === 0 ? (
              <div className="py-16 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 p-8 max-w-xs mx-auto mt-8">
                <FaUtensils className="mx-auto text-3xl text-neutral-300 mb-3" />
                <p className="font-bold text-neutral-700 text-sm">No items found</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-normal">
                  We couldn't find any dishes matching "{search}" or with your active dietary settings.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filtered.map((item) => (
                  <MenuCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Container */}
      <AnimatePresence>
        {(cartItems.length > 0 || hasActiveOrder) && (
          <motion.div 
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-6 left-1/2 z-40 flex gap-3 w-[calc(100%-2rem)] max-w-xs"
          >
            {cartItems.length > 0 && (
              <button
                onClick={() => navigate("/customer/cart")}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-3.5 font-black text-white shadow-md text-xs transition-transform active:scale-95 uppercase tracking-wider"
              >
                <FaShoppingBag />
                <span>View Cart ({cartItems.length})</span>
              </button>
            )}

            {hasActiveOrder && (
              <button
                onClick={() => navigate("/customer/tracking")}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 border border-neutral-800 py-3.5 font-black text-red-500 shadow-md text-xs transition-transform active:scale-95 uppercase tracking-wider"
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
