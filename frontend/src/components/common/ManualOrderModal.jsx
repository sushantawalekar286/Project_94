import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUtensils, FaSearch, FaPlus, FaMinus, FaClipboardList, FaTimes, FaSpinner } from "react-icons/fa";
import { getTables } from "../../services/tableService";
import { getMenu, getCategories } from "../../services/menuService";
import { placeOrder } from "../../services/orderService";
import { motion } from "framer-motion";

export default function ManualOrderModal({ isOpen, onClose, initialTable, onSuccess }) {
  const [tables, setTables] = useState([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    Promise.all([
      getTables()
        .then((res) => setTables(res.data || []))
        .catch(() => toast.error("Failed to load tables")),
      getMenu()
        .then((res) => setMenuItems(res.data?.data || res.data || []))
        .catch(() => toast.error("Failed to load menu items")),
      getCategories()
        .then((res) => setCategories(res.data?.data || res.data || []))
        .catch(() => toast.error("Failed to load categories"))
    ]).finally(() => setLoading(false));

    if (initialTable) {
      setSelectedTableNumber(String(initialTable.number || initialTable));
    } else {
      setSelectedTableNumber("");
    }
    setCartItems([]);
    setNotes("");
    setMenuSearch("");
    setSelectedCategory("all");
  }, [isOpen, initialTable]);

  const addItemToCart = (item, portionType = "single") => {
    let price = item.singlePrice ?? item.price ?? 0;
    if (portionType === "half") price = item.halfPrice;
    if (portionType === "full") price = item.fullPrice;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItem === item._id && i.portionType === portionType);
      if (existing) {
        return prev.map((i) =>
          i.menuItem === item._id && i.portionType === portionType
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItem: item._id,
          name: item.name,
          price,
          quantity: 1,
          portionType
        }
      ];
    });
    toast.success(`Added ${item.name} (${portionType}) to cart`);
  };

  const updateCartQuantity = (menuItemId, portionType, quantity) => {
    if (quantity <= 0) {
      removeCartItem(menuItemId, portionType);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.menuItem === menuItemId && i.portionType === portionType
          ? { ...i, quantity }
          : i
      )
    );
  };

  const removeCartItem = (menuItemId, portionType) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.menuItem === menuItemId && i.portionType === portionType))
    );
  };

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description?.toLowerCase().includes(menuSearch.toLowerCase());
    const itemCatId = item.category?._id || item.category;
    const matchesCategory = selectedCategory === "all" || itemCatId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const submitManualOrder = async () => {
    if (!selectedTableNumber) {
      toast.error("Please select a table number.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Please add items to the cart.");
      return;
    }

    setSubmittingOrder(true);
    try {
      await placeOrder({
        tableNumber: Number(selectedTableNumber),
        items: cartItems.map((i) => ({
          menuItem: i.menuItem,
          quantity: i.quantity,
          portionType: i.portionType
        })),
        specialInstructions: notes,
        source: "Staff Order"
      });
      toast.success("Staff order placed successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to place order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FAF9F6] w-full max-w-5xl rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col h-[85vh] text-neutral-800"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-neutral-800 flex items-center gap-2">
              <FaUtensils className="text-red-600" /> Place Manual Staff Order
            </h3>
            <p className="text-xs text-neutral-450 mt-0.5">
              Take orders directly from customers. Select Table, Browse Menu, Add Items, and Place Order.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-450 hover:text-neutral-600 hover:bg-neutral-50 transition-colors font-bold text-sm"
          >
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 gap-3">
            <FaSpinner className="animate-spin text-3xl text-red-600" />
            <span className="font-bold text-xs">Loading order placement tools...</span>
          </div>
        ) : (
          /* Modal Content: Split Screen */
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[1.3fr_1fr]">
            {/* Left Column: Table Selection & Menu Browsing */}
            <div className="flex flex-col border-r border-neutral-200/50 bg-white overflow-hidden">
              {/* Table Selection Dropdown */}
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 whitespace-nowrap">
                  Select Table Number:
                </span>
                <select
                  value={selectedTableNumber}
                  onChange={(e) => setSelectedTableNumber(e.target.value)}
                  className="w-full sm:w-48 bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold text-neutral-850 focus:outline-none focus:border-red-500 shadow-sm"
                >
                  <option value="">-- Choose Table --</option>
                  {tables.map((t) => (
                    <option key={t._id} value={t.number}>
                      Table {t.number} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search and Category filters */}
              <div className="p-4 border-b border-neutral-100 space-y-3 bg-neutral-50/50">
                <div className="flex gap-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2 flex-1">
                    <FaSearch className="text-red-600 text-xs" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full bg-transparent text-xs text-neutral-850 outline-none placeholder:text-neutral-400 font-semibold"
                    />
                  </label>
                  {menuSearch && (
                    <button
                      onClick={() => setMenuSearch("")}
                      className="px-2 text-xs text-neutral-450 hover:text-neutral-600 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Buttons List */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                      selectedCategory === "all"
                        ? "bg-red-600 text-white"
                        : "bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition ${
                        selectedCategory === cat._id
                          ? "bg-red-600 text-white"
                          : "bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu items list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-3 p-3 bg-[#FAF9F6] border border-neutral-100 rounded-2xl hover:border-red-200 transition-colors items-center justify-between"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <img
                        src={item.imageUrl || "/logo.png"}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = "/logo.png";
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-neutral-850 truncate leading-none">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-neutral-500 mt-1 font-semibold">
                          {item.pricingType === "half-full"
                            ? `Half: ₹${item.halfPrice} · Full: ₹${item.fullPrice}`
                            : `Price: ₹${item.singlePrice ?? item.price}`}
                        </p>
                      </div>
                    </div>

                    {/* Add Action Buttons */}
                    <div className="flex flex-col gap-1 items-end">
                      {item.pricingType === "half-full" ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => addItemToCart(item, "half")}
                            className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2 py-0.5 text-[8px] font-black uppercase"
                          >
                            + Half
                          </button>
                          <button
                            onClick={() => addItemToCart(item, "full")}
                            className="rounded-lg bg-red-600 text-white hover:bg-red-700 px-2 py-0.5 text-[8px] font-black uppercase"
                          >
                            + Full
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItemToCart(item, "single")}
                          className="rounded-lg bg-red-600 text-white hover:bg-red-700 px-2.5 py-1 text-[9px] font-black uppercase"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredMenuItems.length === 0 && (
                  <div className="text-center py-10 text-neutral-400 text-xs font-semibold">
                    No menu items found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Cart Summary & Special Notes */}
            <div className="flex flex-col bg-[#FAF9F6] overflow-hidden">
              <div className="p-4 bg-white border-b border-neutral-100 flex items-center justify-between">
                <h4 className="font-black text-xs text-neutral-850 flex items-center gap-1.5">
                  <FaClipboardList /> Order Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                </h4>
                {selectedTableNumber && (
                  <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                    Table {selectedTableNumber}
                  </span>
                )}
              </div>

              {/* Cart items list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {cartItems.map((item) => (
                  <div
                    key={`${item.menuItem}-${item.portionType}`}
                    className="flex bg-white border border-neutral-100 p-3 rounded-2xl items-center justify-between shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-xs text-neutral-800 truncate">{item.name}</p>
                      <p className="text-[9px] text-red-600 font-extrabold mt-0.5">
                        ₹{item.price} {item.portionType !== "single" && `· ${item.portionType}`}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg bg-white border border-red-600 text-red-600 font-extrabold text-xs h-6.5 shadow-sm overflow-hidden">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.menuItem, item.portionType, item.quantity - 1)
                          }
                          className="w-5.5 h-full flex items-center justify-center hover:bg-red-50 text-red-600"
                        >
                          <FaMinus size={8} />
                        </button>
                        <span className="w-5 text-center select-none font-black text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.menuItem, item.portionType, item.quantity + 1)
                          }
                          className="w-5.5 h-full flex items-center justify-center hover:bg-red-50 text-red-600"
                        >
                          <FaPlus size={8} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeCartItem(item.menuItem, item.portionType)}
                        className="text-neutral-400 hover:text-red-600 p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {cartItems.length === 0 && (
                  <div className="text-center py-16 text-neutral-400 text-xs font-semibold">
                    Cart is empty. Select menu items.
                  </div>
                )}
              </div>

              {/* Special Instructions Input */}
              <div className="p-4 bg-white border-t border-neutral-100">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                    Customer Notes / Special Instructions
                  </span>
                  <textarea
                    placeholder="e.g. Less Sugar, Spicy, Extra Ice..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none focus:border-red-500 resize-none h-16 font-semibold"
                  />
                </label>
              </div>

              {/* Cart Subtotal and Submit */}
              <div className="p-4 bg-white border-t border-neutral-150 space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-850 font-black text-sm">
                    ₹{cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  disabled={cartItems.length === 0 || !selectedTableNumber || submittingOrder}
                  onClick={submitManualOrder}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-sm transition active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  {submittingOrder ? (
                    <>
                      <FaSpinner className="animate-spin" /> Placing Order...
                    </>
                  ) : (
                    "Confirm & Place Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
