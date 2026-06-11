import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaShoppingBag, FaSearch, FaConciergeBell, FaUtensils, FaTimes, FaSortAmountDown } from "react-icons/fa";
import { getMenu, getCategories } from "../../services/menuService";
import { useCart } from "../../hooks/useCart";
import CategoryList from "../../components/menu/CategoryList";
import MenuCard from "../../components/menu/MenuCard";
import { getActiveOrderByTable, getCompletedOrdersCount } from "../../services/orderService";

const fallbackCategories = ["Pizza", "Burgers", "Fries", "Beverages"];
const fallbackImages = {
  Pizza: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
  Fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80",
  Beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80"
};

const fallbackMenu = fallbackCategories.flatMap((category, categoryIndex) =>
  [1, 2, 3].map((count) => {
    const isVeg = count % 2 !== 0;
    return {
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
      vegetarian: isVeg,
      dietaryType: count === 2 ? "egg" : (isVeg ? "veg" : "non-veg"),
      category: { name: category }
    };
  })
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
    title: "Cafe",
    subtitle: "Coffee, Tea, Shakes, Snacks",
    description: "Espresso, mocktails, burgers, pizzas, and light bites",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
  },
  "Chinese Menu": {
    title: "Chinese",
    subtitle: "Noodles, Fried Rice, Starters",
    description: "Delectable noodles, fried rice, momos, soups, and appetizers",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"
  }
};

const getSuperCategoryForItem = (category) => {
  if (!category) return "Cafe Menu";
  const menuType = typeof category === "object" ? category.menuType : "cafe";
  return menuType === "chinese" ? "Chinese Menu" : "Cafe Menu";
};

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [initialLoad, setInitialLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [favoritesSort, setFavoritesSort] = useState("all-time");
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState(
    sessionStorage.getItem("selectedMenuCategory") || ""
  );
  const { tableId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, tableSession, setTableSession } = useCart();

  const [dietaryPref, setDietaryPref] = useState(() => localStorage.getItem("dietaryPref") || "all");
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    } catch {
      return [];
    }
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const changeDietaryPref = (pref) => {
    setDietaryPref(pref);
    localStorage.setItem("dietaryPref", pref);
    const labels = {
      all: "Showing all items",
      veg: "Veg-only menu active",
      "non-veg": "Non-Veg-only menu active",
      egg: "Egg-only menu active"
    };
    toast.success(labels[pref]);
  };

  const handleDietaryChange = (val) => {
    if (dietaryPref === val) {
      changeDietaryPref("all");
    } else {
      changeDietaryPref(val);
    }
  };

  const addToRecentSearches = (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
    toast.success("Recent searches cleared");
  };

  const matchesDietary = (item) => {
    if (dietaryPref === "all") return true;
    const dType = item.dietaryType || (item.vegetarian ? "veg" : "non-veg");
    return dType === dietaryPref;
  };

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
    getCategories()
      .then((res) => {
        const cats = res.data?.data || res.data || [];
        setDbCategories(cats.filter(c => c.isActive !== false));
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });

    getMenu()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setItems(data.length ? data : fallbackMenu);
      })
      .catch(() => setItems(fallbackMenu))
      .finally(() => setLoading(false));

    getCompletedOrdersCount()
      .then((res) => {
        setCompletedOrdersCount(res.data?.count || 0);
      })
      .catch((err) => {
        console.error("Error fetching completed orders count:", err);
      });
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
    if (!selectedMenuCategory) return [];
    return items.filter(item => {
      const superCat = getSuperCategoryForItem(item.category);
      return superCat === selectedMenuCategory;
    });
  }, [items, selectedMenuCategory]);

  const categories = useMemo(() => {
    const list = [{ name: "All" }];
    if (!selectedMenuCategory) return list;
    const targetMenu = selectedMenuCategory === "Chinese Menu" ? "chinese" : "cafe";
    if (dbCategories.length > 0) {
      dbCategories.forEach((cat) => {
        const catMenuType = cat.menuType || "cafe";
        if (catMenuType !== targetMenu) return;
        
        const hasItems = menuItemsFilteredBySuper.some(
          (item) => (item.category?._id || item.category) === cat._id || item.category?.name === cat.name
        );
        if (hasItems) {
          list.push(cat);
        }
      });
    } else {
      const names = [...new Set(menuItemsFilteredBySuper.map((item) => item.category?.name).filter(Boolean))];
      names.forEach(name => list.push({ name }));
    }
    return list;
  }, [dbCategories, menuItemsFilteredBySuper, selectedMenuCategory]);

  const frequentlyOrdered = useMemo(() => {
    return [...menuItemsFilteredBySuper]
      .filter(matchesDietary)
      .filter((item) => Number(item.totalQuantitySold || 0) > 0)
      .sort((a, b) => {
        const salesDiff = Number(b.totalQuantitySold || 0) - Number(a.totalQuantitySold || 0);
        if (salesDiff !== 0) return salesDiff;
        const ordersDiff = Number(b.totalOrders || 0) - Number(a.totalOrders || 0);
        if (ordersDiff !== 0) return ordersDiff;
        return Number(b.rating || 0) - Number(a.rating || 0);
      })
      .slice(0, 6);
  }, [menuItemsFilteredBySuper, dietaryPref]);

  const sortedFavorites = useMemo(() => {
    let base = [...menuItemsFilteredBySuper]
      .filter(matchesDietary)
      .filter((item) => Number(item.totalQuantitySold || 0) > 0);
    if (favoritesSort === "today") {
      base.sort((a, b) => Number(b.rating || 4.5) - Number(a.rating || 4.5));
    } else if (favoritesSort === "week") {
      base.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (favoritesSort === "month") {
      base.sort((a, b) => Number(b.totalOrders || 0) - Number(a.totalOrders || 0));
    } else {
      base.sort((a, b) => Number(b.totalQuantitySold || 0) - Number(a.totalQuantitySold || 0));
    }
    return base;
  }, [menuItemsFilteredBySuper, favoritesSort, dietaryPref]);

  const cartTotalCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const cartTotalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  const groupedItems = useMemo(() => {
    const groups = {};
    const queryWords = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    menuItemsFilteredBySuper.forEach((item) => {
      const catName = item.category?.name || "Other";
      if (category !== "All" && catName !== category) {
        return;
      }
      const itemText = `${item.name} ${catName} ${item.description || ""}`.toLowerCase();
      const matchesSearch = queryWords.length === 0 || queryWords.every((word) => itemText.includes(word));
      const matchesVeg = matchesDietary(item);
      if (matchesSearch && matchesVeg) {
        if (!groups[catName]) groups[catName] = [];
        groups[catName].push(item);
      }
    });
    return groups;
  }, [menuItemsFilteredBySuper, search, dietaryPref, category]);

  const scrollToCategory = (catName) => {
    setCategory(catName);
    setInitialLoad(false);
    if (catName === "All") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setTimeout(() => {
      const el = document.getElementById(`category-sec-${catName}`);
      if (el) {
        const offset = 210; 
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 50);
  };

  if (!selectedMenuCategory) {
    return (
      <section className="min-h-screen bg-[#FAF9F6] px-4 py-12 flex flex-col items-center justify-center text-neutral-800">
        <div className="w-full max-w-2xl text-center flex flex-col items-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-8"
          >
            <img 
              src="/logo.png" 
              alt="94 Cafe & Chinese Logo" 
              className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl object-cover shadow-2xl border-4 border-white mb-6 transform hover:rotate-3 transition-transform duration-300" 
            />
            <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-none">
              94 Cafe & Chinese
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base font-medium mt-3.5 max-w-md mx-auto leading-relaxed">
              Welcome to our digital ordering experience
            </p>
            <div className="mt-4 rounded-full bg-red-50 border border-red-100 px-4 py-1.5 text-[10px] font-black text-red-650 uppercase tracking-widest">
              Table {tableSession.tableNumber || tableId || 1}
            </div>
          </motion.div>

          {/* Cards Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full px-2"
          >
            {Object.entries(SUPER_CATEGORIES).map(([key, config]) => (
              <motion.div
                key={key}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sessionStorage.setItem("selectedMenuCategory", key);
                  setSelectedMenuCategory(key);
                }}
                className="relative cursor-pointer overflow-hidden rounded-[32px] border border-neutral-200/50 bg-neutral-900 text-left shadow-lg hover:shadow-xl transition-all duration-300 h-64 flex flex-col justify-end p-6 group"
              >
                {/* Background Image with zoom on hover */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                  style={{ backgroundImage: `url(${config.image})` }}
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-end">
                    <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[9px] font-black text-white uppercase tracking-wider">
                      {config.title}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-white group-hover:text-red-400 transition-colors tracking-tight">
                      {config.title}
                    </h2>
                    <p className="mt-1 text-xs text-red-400 font-extrabold uppercase tracking-wider leading-none">
                      {config.subtitle}
                    </p>
                    <p className="mt-2 text-xs text-white/80 leading-relaxed font-medium line-clamp-2">
                      {config.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black text-white uppercase tracking-wider bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl transition shadow-sm">
                      View Menu &rarr;
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FAF9F6] text-neutral-800 pb-28">
      {/* Top Premium Header Card */}
      <div className="bg-gradient-to-r from-amber-955 from-amber-950 via-red-950 to-amber-950 text-white px-4 pt-6 pb-9 rounded-b-[40px] shadow-lg relative overflow-hidden">
        {/* Background Decorative patterns */}
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo in white circle container */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white rounded-full p-1.5 shadow-md flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="94 Cafe Logo" className="h-full w-full object-cover rounded-full" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">94 Cafe & Chinese</h1>
              <p className="text-[11px] sm:text-xs text-white/80 mt-1.5 font-medium tracking-wide">
                Cafe &bull; Chinese &bull; Fast Food
              </p>
              <div className="flex items-center gap-1.5 mt-2 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full w-fit">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-[10px] font-black text-amber-300">4.8</span>
                <span className="text-[10px] font-semibold text-white/70">({completedOrdersCount} {completedOrdersCount === 1 ? 'Order' : 'Orders'})</span>
              </div>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2.5">
            {selectedMenuCategory && (
              <button
                onClick={() => {
                  sessionStorage.removeItem("selectedMenuCategory");
                  setSelectedMenuCategory("");
                  setCategory("All");
                }}
                className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 px-3 py-1.5 text-[9px] font-black text-white active:scale-95 transition-all uppercase tracking-wider"
              >
                Switch Menu
              </button>
            )}

            {/* Cart Icon with badge */}
            <button
              onClick={() => navigate("/customer/cart")}
              className="relative flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <FaShoppingBag className="text-sm" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-650 bg-red-600 text-[9px] font-black text-white h-4.5 w-4.5 rounded-full flex items-center justify-center border border-amber-955 border-amber-950">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="px-4 -mt-5 relative z-40 max-w-3xl mx-auto">
        <div className="relative">
          <div className="flex gap-2 bg-white rounded-2xl shadow-md border border-neutral-100 p-1.5">
            <label className="flex-1 flex items-center gap-2.5 px-3.5 py-2">
              <FaSearch className="text-neutral-400 text-sm" />
              <input
                className="w-full bg-transparent text-xs text-neutral-800 outline-none placeholder:text-neutral-400 font-medium"
                value={search}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                onChange={(event) => {
                  setSearch(event.target.value);
                  if (event.target.value.trim() !== "") {
                    setInitialLoad(false);
                  }
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addToRecentSearches(search);
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Search food, beverages, snacks..."
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setShowSuggestions(false);
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-605 hover:text-neutral-600 active:scale-90"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </label>
            {/* Voice Mic Icon (UI Only) */}
            <button
              type="button"
              onClick={() => toast.success("Voice search listening... (Demo)")}
              className="h-10 w-10 rounded-xl bg-orange-655 bg-orange-600 text-white flex items-center justify-center active:scale-95 transition-transform text-sm"
            >
              🎤
            </button>
          </div>

          {/* Suggestions Dropdown panel */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-100 z-50 overflow-hidden max-h-72 overflow-y-auto">
              {!search.trim() ? (
                recentSearches.length > 0 ? (
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black text-neutral-450 uppercase tracking-wider">
                      <span>Recent Searches</span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-red-500 hover:underline bg-transparent border-0 lowercase font-extrabold"
                      >
                        Clear recent searches
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {recentSearches.map((s, idx) => (
                        <button
                          key={`recent-${idx}`}
                          type="button"
                          onClick={() => {
                            setSearch(s);
                            addToRecentSearches(s);
                            setShowSuggestions(false);
                          }}
                          className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 rounded-full px-3 py-1 text-[10px] font-bold text-neutral-700 transition active:scale-95"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-neutral-400 font-semibold">
                    Type to search dishes or categories...
                  </div>
                )
              ) : (
                <div className="divide-y divide-neutral-50">
                  {(() => {
                    const queryWords = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
                    const filteredSuggestions = menuItemsFilteredBySuper
                      .filter(matchesDietary)
                      .filter((item) => {
                        const catName = item.category?.name || "";
                        const itemText = `${item.name} ${catName} ${item.description || ""}`.toLowerCase();
                        return queryWords.every((word) => itemText.includes(word));
                      })
                      .slice(0, 6);

                    if (filteredSuggestions.length === 0) {
                      return (
                        <div className="p-4 text-center text-xs text-neutral-450 font-bold">
                          No suggestions found
                        </div>
                      );
                    }

                    return filteredSuggestions.map((item) => (
                      <div
                        key={`sug-${item._id}`}
                        onClick={() => {
                          setSearch(item.name);
                          addToRecentSearches(item.name);
                          setShowSuggestions(false);
                          const el = document.getElementById(`item-${item._id}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            el.classList.add("bg-orange-50");
                            setTimeout(() => el.classList.remove("bg-orange-50"), 1500);
                          }
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-neutral-50 cursor-pointer transition-colors duration-155"
                      >
                        <img
                          src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&q=80"}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-neutral-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-neutral-455 truncate font-semibold">
                            in {item.category?.name || "Other"}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-black text-neutral-900">
                          ₹{item.pricingType === "half-full" ? item.fullPrice || item.price : item.singlePrice || item.price}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Categories Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-100/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] py-2 mt-2">
        <div className="max-w-5xl mx-auto space-y-2">
          {/* Section Indicator and Food Type Filter */}
          <div className="flex items-center justify-between px-4 border-b border-neutral-100/40 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
              {selectedMenuCategory === "Chinese Menu" ? "🍜 Chinese Menu" : "☕ Cafe Menu"}
            </span>
            {/* Food Type Selector */}
            <div className="flex items-center gap-4">
              {[
                { val: "all", label: "All" },
                { val: "veg", label: "Veg" },
                { val: "non-veg", label: "Non Veg" }
              ].map((pref) => {
                const isSelected = dietaryPref === pref.val;
                return (
                  <label
                    key={`header-pref-${pref.val}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDietaryChange(pref.val);
                    }}
                    className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-neutral-700 select-none"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected 
                        ? "border-red-650 bg-red-650 bg-red-600 text-white" 
                        : "border-neutral-300 hover:border-neutral-400"
                    }`}>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span>{pref.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <CategoryList categories={categories} active={category} onSelect={scrollToCategory} />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        {loading ? (
          <MenuSkeleton />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            
            {/* Left Side: Main items list (col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
                        {/* Mobile Only: Frequently Ordered Slider */}
              {!search && (
                <div className="mt-2 mb-6 lg:hidden">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black">🔥</span>
                      <h2 className="text-base font-black text-neutral-850 tracking-tight">Most Ordered Today</h2>
                    </div>
                    {frequentlyOrdered.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowFavoritesModal(true)}
                        className="text-xs font-black text-orange-655 cursor-pointer hover:underline bg-transparent border-0"
                      >
                        View All &rarr;
                      </button>
                    )}
                  </div>

                  {frequentlyOrdered.length > 0 ? (
                    <div className="flex gap-3.5 overflow-x-auto pb-3.5 scrollbar-hide select-none">
                      {frequentlyOrdered.map((item) => {
                        const itemPrice = item.pricingType === "half-full" ? item.fullPrice ?? item.price : item.singlePrice ?? item.price;
                        const orderCount = item.totalQuantitySold || 0;
                        return (
                          <div
                            key={`freq-mob-${item._id}`}
                            onClick={() => {
                              const catName = item.category?.name;
                              if (catName) {
                                setCategory(catName);
                                setTimeout(() => {
                                  const el = document.getElementById(`item-${item._id}`);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    el.classList.add("bg-orange-50");
                                    setTimeout(() => el.classList.remove("bg-orange-50"), 1500);
                                  }
                                }, 100);
                              }
                            }}
                            className="w-36 flex-shrink-0 bg-white border border-neutral-100 rounded-3xl p-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <div className="w-full h-24 rounded-2xl overflow-hidden bg-neutral-50 relative">
                                <img
                                  src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <p className="text-[11px] font-extrabold text-neutral-800 line-clamp-1 mt-2 px-1 leading-tight">
                                {item.name}
                              </p>
                              <p className="text-[9px] font-bold text-neutral-400 px-1 mt-0.5">
                                Ordered {orderCount} times
                              </p>
                            </div>
                            <div className="flex justify-between items-center mt-1.5 px-1 pb-1">
                              <span className="text-xs font-black text-neutral-900 font-mono">₹{itemPrice}</span>
                              <div className="flex items-center gap-0.5 text-[8px] font-black text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded">
                                <span className="text-amber-500">★</span>
                                <span>{item.rating || "4.5"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-neutral-400 text-xs font-semibold py-4 px-2 bg-white rounded-3xl border border-neutral-100/60 text-center">
                      No order data available yet
                    </div>
                  )}
                </div>
              )}

              {/* Grouped Subcategory Product List */}
              {Object.keys(groupedItems).length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-[32px] border border-neutral-100 shadow-sm max-w-md mx-auto mt-4">
                  <span className="text-4xl mb-3">🍽️</span>
                  <h3 className="text-sm font-extrabold text-neutral-800 mb-1">No menu items found.</h3>
                  <p className="text-xs text-neutral-400 font-medium max-w-xs mb-5">
                    We couldn't find any dishes matching your active search, category, or dietary settings.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("All");
                      changeDietaryPref("all");
                      setSearch("");
                    }}
                    className="rounded-xl bg-orange-655 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-black transition-all active:scale-95 shadow-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([catName, catItems]) => (
                    <div key={catName} id={`category-sec-${catName}`} className="bg-white rounded-[32px] p-4 border border-neutral-100 shadow-sm scroll-mt-28">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-neutral-100/60">
                        <h2 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-1.5">
                          <span>
                            {catName === "Pizza" ? "🍕" : 
                             catName === "Burgers" ? "🍔" : 
                             catName === "Chinese" || catName.includes("Noodle") ? "🍜" : 
                             catName === "Fries" ? "🍟" : 
                             catName === "Beverages" || catName.includes("Coffee") ? "🥤" : "🍽️"}
                          </span>
                          {catName}
                        </h2>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider bg-neutral-50 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                          {catItems.length} Items
                        </span>
                      </div>
                      <div className="divide-y divide-neutral-100">
                        {catItems.map((item) => (
                          <MenuCard key={item._id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Desktop-Only Sticky Panel (col-span-4) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
              
              {/* Veg Toggle & Table ID Panel */}
              <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider border-b border-neutral-50 pb-2">Preferences</h3>
                <div className="space-y-3">
                  <span className="text-xs text-neutral-550 text-neutral-500 font-bold block mb-2">Dietary Preference</span>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { val: "all", label: "All Items" },
                      { val: "veg", label: "Veg Only" },
                      { val: "non-veg", label: "Non Veg Only" },
                      { val: "egg", label: "Egg Only" }
                    ].map((pref) => {
                      const isSelected = dietaryPref === pref.val;
                      return (
                        <label
                          key={`desk-pref-${pref.val}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDietaryChange(pref.val);
                          }}
                          className="flex items-center gap-3 cursor-pointer group text-xs font-semibold text-neutral-700 select-none py-1"
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
                            isSelected 
                              ? "border-neutral-900 bg-neutral-900 text-white" 
                              : "border-neutral-300 group-hover:border-neutral-400"
                          }`}>
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span>{pref.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-50 pt-3">
                  <span className="text-xs text-neutral-500 font-bold">Your Table</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black border border-neutral-200 text-neutral-750 bg-neutral-50">
                    Table {tableSession.tableNumber || 1}
                  </span>
                </div>
              </div>

              {/* Desktop-Only Favorites Panel */}
              {!search && (
                <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-black">🔥</span>
                      <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wider">Most Ordered</h3>
                    </div>
                    {frequentlyOrdered.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowFavoritesModal(true)}
                        className="text-[10px] font-black text-orange-600 hover:underline bg-transparent border-0 uppercase tracking-wider"
                      >
                        View All &rarr;
                      </button>
                    )}
                  </div>
                  {frequentlyOrdered.length > 0 ? (
                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-hide">
                      {frequentlyOrdered.map((item) => {
                        const itemPrice = item.pricingType === "half-full" ? item.fullPrice ?? item.price : item.singlePrice ?? item.price;
                        const orderCount = item.totalQuantitySold || 0;
                        return (
                          <div
                            key={`freq-desk-${item._id}`}
                            onClick={() => {
                              const catName = item.category?.name;
                              if (catName) {
                                setCategory(catName);
                                setTimeout(() => {
                                  const el = document.getElementById(`item-${item._id}`);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    el.classList.add("bg-orange-50");
                                    setTimeout(() => el.classList.remove("bg-orange-50"), 1500);
                                  }
                                }, 100);
                              }
                            }}
                            className="flex gap-3 items-center p-2 rounded-2xl border border-neutral-100/60 hover:bg-neutral-50/50 cursor-pointer transition-all duration-200"
                          >
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0">
                              <img
                                src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-extrabold text-neutral-800 truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
                                Ordered {orderCount} times
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-neutral-900">₹{itemPrice}</span>
                                <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-1 rounded flex items-center gap-0.5">
                                  ★ {item.rating || "4.5"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-neutral-400 text-xs font-semibold py-4 text-center">
                      No order data available yet
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Action/Cart Bar */}
      <AnimatePresence>
        {(cartItems.length > 0 || hasActiveOrder) && (
          <motion.div
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md flex flex-col gap-2.5"
          >
            {hasActiveOrder && (
              <button
                onClick={() => navigate("/customer/tracking")}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 border border-neutral-800 py-3.5 font-black text-orange-500 shadow-lg text-xs transition-transform active:scale-95 uppercase tracking-wider"
              >
                <FaConciergeBell className="animate-pulse text-amber-500" />
                <span>Track Active Order</span>
              </button>
            )}

            {cartItems.length > 0 && (
              <div 
                onClick={() => navigate("/customer/cart")}
                className="cursor-pointer flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-600 to-red-650 px-4 py-3.5 shadow-xl text-white transition-transform active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center h-10 w-10 bg-white/20 rounded-full">
                    <FaShoppingBag className="text-white text-base" />
                    <span className="absolute -top-1.5 -right-1.5 bg-red-650 bg-red-600 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border border-white">
                      {cartTotalCount}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black tracking-wide uppercase">{cartTotalCount} {cartTotalCount === 1 ? "Item" : "Items"} | ₹{cartTotalPrice}</p>
                    <p className="text-[10px] text-white/80 font-medium">Add items to explore more flavor</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                  <span>View Cart</span>
                  <span className="text-sm font-bold">&rarr;</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View All Favorites Modal */}
      <AnimatePresence>
        {showFavoritesModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <h2 className="text-base font-black text-neutral-800 tracking-tight">Customer Favorites</h2>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">Most Loved Items</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFavoritesModal(false)}
                  className="p-2 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-800 shadow-sm active:scale-95 transition-transform"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Sorting Filter Selector */}
              <div className="px-5 py-3 border-b border-neutral-100 bg-white flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 text-[10px] font-black text-neutral-400 uppercase tracking-wider flex-shrink-0">
                  <FaSortAmountDown className="text-xs text-neutral-500" />
                  <span>Sort By:</span>
                </div>
                <div className="flex gap-1.5 flex-nowrap">
                  {[
                    ["today", "Today"],
                    ["week", "This Week"],
                    ["month", "This Month"],
                    ["all-time", "All-Time"]
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFavoritesSort(val)}
                      className={`rounded-full px-3 py-1 text-[9px] font-black uppercase transition-all duration-155 border flex-shrink-0 ${
                        favoritesSort === val
                          ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm font-black"
                          : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorites Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-100 min-h-[300px]">
                {sortedFavorites.map((item) => {
                  const orderCount = item.totalQuantitySold || 0;
                  return (
                    <div key={`fav-modal-${item._id}`} className="relative">
                      <div className="absolute top-2 right-2 z-10 rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[8.5px] font-black text-neutral-500 shadow-sm">
                        Ordered {orderCount} times
                      </div>
                      <MenuCard item={item} />
                    </div>
                  );
                })}
                {sortedFavorites.length === 0 && (
                  <div className="py-12 text-center text-neutral-400 text-xs font-semibold">
                    No order data available yet
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
