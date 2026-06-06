import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUtensils, FaSyncAlt, FaSignOutAlt, FaConciergeBell, FaCheck, FaBan, FaCheckCircle, FaPlus, FaPrint, FaSearch } from "react-icons/fa";
import { getTables, updateTableStatus } from "../../services/tableService";
import { updateOrderStatus, placeOrder } from "../../services/orderService";
import { getMenu, getCategories } from "../../services/menuService";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "../../components/chef/StatusBadge";

export default function WaiterDashboard() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { logout } = useAuth();

  // Waiter ordering state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await getTables();
      const tableData = res.data || [];
      setTables(tableData);
      
      // Update selected table in real time if open
      if (selectedTable) {
        const updated = tableData.find(t => t._id === selectedTable._id);
        setSelectedTable(updated || null);
      }
    } catch (error) {
      console.error("[WaiterDashboard] Error fetching tables:", error);
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;
    socket.emit("join:admin"); // join admin channel for general updates
    
    const handleTableUpdate = (updatedTable) => {
      setTables(prev => prev.map(t => t._id === updatedTable._id ? updatedTable : t));
      if (selectedTable && selectedTable._id === updatedTable._id) {
        setSelectedTable(updatedTable);
      }
    };

    const handleOrderUpdate = () => {
      refresh().catch(() => {});
    };

    socket.on("table:updated", handleTableUpdate);
    socket.on("order:new", handleOrderUpdate);
    socket.on("order:updated", handleOrderUpdate);

    return () => {
      socket.off("table:updated", handleTableUpdate);
      socket.off("order:new", handleOrderUpdate);
      socket.off("order:updated", handleOrderUpdate);
    };
  }, [socket, selectedTable]);

  const handleTableStatusChange = async (tableId, status) => {
    try {
      const payload = { status };
      if (status === "available") {
        payload.activeOrder = null;
      }
      const res = await updateTableStatus(tableId, status, payload.activeOrder);
      toast.success(`Table status updated to ${status}`);
      setTables(prev => prev.map(t => t._id === tableId ? res.data : t));
      if (selectedTable && selectedTable._id === tableId) {
        setSelectedTable(res.data);
      }
    } catch (error) {
      toast.error("Failed to update table status");
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      await refresh();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handlePrintBill = (order) => {
    if (!order) return;
    const printWindow = window.open("", "_blank");
    
    let itemsText = "";
    order.items?.forEach((item) => {
      const name = item.name.padEnd(14).substring(0, 14);
      const qty = String(item.quantity).padStart(3);
      const price = `₹${(item.price * item.quantity).toFixed(0)}`.padStart(10);
      itemsText += `${name} ${qty} ${price}\n`;
    });

    const subtotalStr = `₹${(order.subtotal || 0).toFixed(0)}`;
    const discountStr = `₹${(order.discount || 0).toFixed(0)}`;
    const grandTotalStr = `₹${(order.total || 0).toFixed(0)}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Table ${order.tableNumber}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
              color: #000;
              background-color: #fff;
            }
            pre {
              margin: 0;
              white-space: pre-wrap;
              font-size: 14px;
              line-height: 1.2;
            }
            h2 {
              text-align: center;
              margin: 0 0 10px 0;
              font-size: 16px;
            }
            .center {
              text-align: center;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h2>94 CAFE & CHINESE RECEIPT</h2>
          <div class="center" style="font-size: 12px; margin-bottom: 10px;">
            Table: ${order.tableNumber}<br>
            Date: ${new Date(order.createdAt).toLocaleString()}<br>
            Order ID: ${order._id.substring(0, 8)}...
          </div>
          <pre>
Item Name     Qty     Price
150: ---------------------------
${itemsText}---------------------------
Subtotal       ${subtotalStr.padStart(12)}
Discount       ${discountStr.padStart(12)}
Grand Total    ${grandTotalStr.padStart(12)}
          </pre>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Waiter ordering actions
  const openOrderModal = async (table) => {
    setIsOrderModalOpen(true);
    setCartItems([]);
    try {
      const menuRes = await getMenu();
      const menuArray = menuRes.data?.data || menuRes.data || [];
      setMenuItems(Array.isArray(menuArray) ? menuArray : []);

      const catRes = await getCategories();
      const catArray = catRes.data?.data || catRes.data || [];
      setCategories(Array.isArray(catArray) ? catArray : []);
    } catch (e) {
      toast.error("Failed to load menu items");
    }
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setCartItems([]);
  };

  const addItemToCart = (item, portionType = "single") => {
    let price = item.singlePrice ?? item.price ?? 0;
    if (portionType === "half") price = item.halfPrice;
    if (portionType === "full") price = item.fullPrice;

    setCartItems(prev => {
      const existing = prev.find(i => i.menuItem === item._id && i.portionType === portionType);
      if (existing) {
        return prev.map(i => i.menuItem === item._id && i.portionType === portionType 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...prev, {
        menuItem: item._id,
        name: item.name,
        price,
        quantity: 1,
        portionType
      }];
    });
    toast.success(`Added ${item.name} (${portionType === "single" ? "portion" : portionType}) to cart`);
  };

  const updateCartQuantity = (menuItemId, portionType, quantity) => {
    if (quantity <= 0) {
      removeCartItem(menuItemId, portionType);
      return;
    }
    setCartItems(prev => prev.map(i => i.menuItem === menuItemId && i.portionType === portionType
      ? { ...i, quantity }
      : i
    ));
  };

  const removeCartItem = (menuItemId, portionType) => {
    setCartItems(prev => prev.filter(i => !(i.menuItem === menuItemId && i.portionType === portionType)));
  };

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          item.description?.toLowerCase().includes(menuSearch.toLowerCase());
    const itemCatId = item.category?._id || item.category;
    const matchesCategory = selectedCategory === "all" || itemCatId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const submitWaiterOrder = async () => {
    if (cartItems.length === 0) return;
    setSubmittingOrder(true);
    try {
      await placeOrder({
        tableNumber: selectedTable.number,
        items: cartItems.map(i => ({
          menuItem: i.menuItem,
          quantity: i.quantity,
          portionType: i.portionType
        }))
      });
      toast.success("Order placed successfully!");
      closeOrderModal();
      await refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to place order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF9F6] px-4 py-8 sm:px-8 relative text-neutral-800 font-sans">
      
      {/* Header */}
      <header className="relative mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-neutral-200/50 pb-5">
        <div className="flex items-center gap-3.5">
          <img src="/logo.png" alt="94 Cafe & Chinese" className="h-16 w-16 rounded-2xl object-cover shadow-md border border-neutral-200 bg-white" />
          <div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-red-600 font-black">
              <FaConciergeBell /> Waiter Control Panel
            </p>
            <h1 className="mt-0.5 text-2xl font-black tracking-tight text-neutral-800 leading-none">Tables & Billings</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50 shadow-sm transition-all">
            <FaSyncAlt /> Refresh
          </button>
          <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-all">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        
        {/* Active Tables Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-neutral-800 tracking-tight">Tables Overview</h2>
          
          {loading && tables.length === 0 ? (
            <div className="flex justify-center items-center py-20 text-neutral-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
              {tables.map((table) => {
                const isSelected = selectedTable?._id === table._id;
                const statusStyles = {
                  available: "border-green-200 bg-white text-green-700 hover:border-green-300",
                  occupied: "border-red-200 bg-white text-red-700 hover:border-red-300",
                  cleaning: "border-amber-200 bg-white text-amber-700 hover:border-amber-300",
                  reserved: "border-blue-200 bg-white text-blue-700 hover:border-blue-300"
                };

                return (
                  <motion.div
                    key={table._id}
                    onClick={() => setSelectedTable(table)}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`cursor-pointer rounded-3xl border p-5 flex flex-col justify-between min-h-36 transition-all shadow-sm ${
                      isSelected ? "border-red-600 ring-2 ring-red-600/20 bg-white" : statusStyles[table.status] || "border-neutral-200 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-wider font-black opacity-60 text-neutral-400">Table</span>
                        <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border border-current bg-neutral-50`}>
                          {table.status}
                        </span>
                      </div>
                      <p className="mt-2 text-3xl font-black tracking-tight text-neutral-800">{table.number}</p>
                    </div>

                    {table.activeOrder && (
                      <div className="mt-4 border-t border-neutral-100 pt-2 text-xs">
                        <p className="font-black text-red-600">₹{table.activeOrder.total?.toFixed(2)}</p>
                        <p className="truncate text-[10px] font-bold text-neutral-400 mt-0.5">{table.activeOrder.status}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Billing & Action side panel */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-neutral-800 tracking-tight">Active Billing Panel</h2>
          
          <AnimatePresence mode="wait">
            {selectedTable ? (
              <motion.div
                key={selectedTable._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-3xl border border-neutral-200 bg-white p-6 space-y-6 shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-black text-neutral-850">Table {selectedTable.number}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Configure status and orders</p>
                  </div>
                  
                  {/* Order placement shortcut */}
                  <button
                    onClick={() => openOrderModal(selectedTable)}
                    className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-red-700 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl px-3 py-2 shadow-sm transition-all"
                  >
                    <FaPlus className="inline mr-1 text-[10px]" /> New Order
                  </button>
                </div>

                {/* Table Quick Status Selection */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Quick Status Configuration</p>
                  <div className="flex gap-2">
                    {["available", "cleaning", "reserved"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleTableStatusChange(selectedTable._id, st)}
                        className={`text-xs font-black px-4 py-2.5 rounded-xl border capitalize transition-all ${
                          selectedTable.status === st
                            ? "border-red-600 bg-red-50 text-red-600"
                            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTable.activeOrder ? (
                  <div className="space-y-6 pt-4 border-t border-neutral-100">
                    <div className="flex justify-between items-start bg-neutral-50 border border-neutral-100 p-4 rounded-2xl">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Active Order ID</p>
                        <p className="font-mono text-xs font-bold text-neutral-600 mt-0.5">{selectedTable.activeOrder._id}</p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <StatusBadge status={selectedTable.activeOrder.status} />
                          <span className="text-[10px] text-neutral-400 font-bold">
                            {new Date(selectedTable.activeOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      <span className="text-xl font-black text-red-600">₹{selectedTable.activeOrder.total?.toFixed(2)}</span>
                    </div>

                    {/* Ordered Items List */}
                    <div className="space-y-3">
                      <p className="text-xs uppercase font-black tracking-wider text-neutral-450">Ordered Items</p>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {selectedTable.activeOrder.items?.map((item) => (
                          <div key={item._id || item.menuItem} className="flex justify-between items-center text-sm bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                            <div>
                              <p className="font-bold text-neutral-800">{item.name}</p>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                Qty: {item.quantity} {item.portionType !== "single" && `· ${item.portionType}`}
                              </p>
                            </div>
                            <span className="font-black text-red-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Print Bill Action */}
                    <div className="border-t border-neutral-100 pt-4">
                      <button
                        onClick={() => handlePrintBill(selectedTable.activeOrder)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-100 transition-all active:scale-95"
                      >
                        <FaPrint /> Print Bill / Receipt
                      </button>
                    </div>

                    {/* Quick billing status actions */}
                    <div className="border-t border-neutral-100 pt-4 space-y-3">
                      <p className="text-[10px] uppercase tracking-wider font-black text-neutral-400">Order Status Control</p>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTable.activeOrder.status === "Ready" && (
                          <button
                            onClick={() => handleOrderStatusChange(selectedTable.activeOrder._id, "Served")}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-sm active:scale-95 transition-transform hover:bg-green-500"
                          >
                            <FaCheck /> Mark Served
                          </button>
                        )}
                        {(selectedTable.activeOrder.status === "Served" || selectedTable.activeOrder.status === "Completed") && (
                          <button
                            onClick={() => handleOrderStatusChange(selectedTable.activeOrder._id, "Paid")}
                            className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm active:scale-95 transition-transform hover:bg-emerald-500"
                          >
                            <FaCheckCircle /> Mark Paid (Free Table)
                          </button>
                        )}
                        {["Pending", "Accepted", "Cooking"].includes(selectedTable.activeOrder.status) && (
                          <button
                            onClick={() => handleOrderStatusChange(selectedTable.activeOrder._id, "Cancelled")}
                            className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-100 transition-all"
                          >
                            <FaBan /> Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-neutral-500 space-y-5 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                    <FaUtensils className="mx-auto text-4xl text-neutral-300" />
                    <div className="space-y-1">
                      <p className="font-black text-neutral-800">No Active Order</p>
                      <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-normal">This table is currently not serving any guests.</p>
                    </div>
                    <button
                      onClick={() => openOrderModal(selectedTable)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition active:scale-95"
                    >
                      <FaPlus /> Place New Order
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/50 p-10 text-center text-neutral-450 shadow-sm text-sm font-semibold">
                Select a table from the overview to manage billing, configure status, or execute payment controls.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Order Creation Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FAF9F6] w-full max-w-5xl rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col h-[85vh] text-neutral-800"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-800">New Order for Table {selectedTable?.number}</h3>
                <p className="text-xs text-neutral-450 mt-0.5">Select items from the menu to create a cart and submit the order</p>
              </div>
              <button 
                onClick={closeOrderModal}
                className="rounded-full p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content: Split Screen */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[1.3fr_1fr]">
              
              {/* Left Column: Menu Browsing */}
              <div className="flex flex-col border-r border-neutral-200/50 bg-white overflow-hidden">
                {/* Search and Category filters */}
                <div className="p-4 border-b border-neutral-100 space-y-3 bg-neutral-50/50">
                  <div className="flex gap-2">
                    <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 flex-1">
                      <FaSearch className="text-red-600" />
                      <input
                        type="text"
                        placeholder="Search menu items..."
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-semibold"
                      />
                    </label>
                    {menuSearch && (
                      <button 
                        onClick={() => setMenuSearch("")}
                        className="px-3 text-xs text-neutral-450 hover:text-neutral-600 font-bold"
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
                        selectedCategory === "all" ? "bg-red-600 text-white" : "bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition ${
                          selectedCategory === cat._id ? "bg-red-600 text-white" : "bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu items grid */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredMenuItems.map((item) => (
                    <div 
                      key={item._id} 
                      className="flex gap-3 p-3 bg-[#FAF9F6] border border-neutral-100 rounded-2xl hover:border-red-200 transition-colors items-center justify-between"
                    >
                      <div className="flex gap-3 items-center min-w-0">
                        <img 
                          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-200 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80";
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-black text-sm text-neutral-800 truncate leading-none">{item.name}</h4>
                          <p className="text-[10px] text-neutral-500 mt-1.5 font-semibold">
                            {item.pricingType === "half-full" 
                              ? `Half portion: ₹${item.halfPrice} · Full portion: ₹${item.fullPrice}` 
                              : `Price: ₹${item.singlePrice ?? item.price}`}
                          </p>
                        </div>
                      </div>

                      {/* Add Action Buttons */}
                      <div className="flex flex-col gap-1.5 items-end">
                        {item.pricingType === "half-full" ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => addItemToCart(item, "half")}
                              className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2 py-1 text-[9px] font-black uppercase"
                            >
                              + Half (₹{item.halfPrice})
                            </button>
                            <button
                              onClick={() => addItemToCart(item, "full")}
                              className="rounded-lg bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-[9px] font-black uppercase"
                            >
                              + Full (₹{item.fullPrice})
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addItemToCart(item, "single")}
                            className="rounded-lg bg-red-600 text-white hover:bg-red-700 px-3 py-1 text-[10px] font-black uppercase"
                          >
                            + Add (₹{item.singlePrice ?? item.price})
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredMenuItems.length === 0 && (
                    <div className="text-center py-10 text-neutral-400 text-sm">
                      No menu items found.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Cart Summary */}
              <div className="flex flex-col bg-[#FAF9F6] overflow-hidden">
                <div className="p-4 bg-white border-b border-neutral-100">
                  <h4 className="font-black text-sm text-neutral-800">Order Cart</h4>
                </div>
                
                {/* Cart items list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {cartItems.map((item) => (
                    <div 
                      key={`${item.menuItem}-${item.portionType}`}
                      className="flex bg-white border border-neutral-100 p-3 rounded-2xl items-center justify-between shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-sm text-neutral-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-red-600 font-extrabold mt-0.5">
                          ₹{item.price} {item.portionType !== "single" && `· ${item.portionType}`}
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-xl bg-white border border-red-600 text-red-600 font-extrabold text-xs h-7 shadow-sm overflow-hidden">
                          <button 
                            onClick={() => updateCartQuantity(item.menuItem, item.portionType, item.quantity - 1)}
                            className="w-6 h-full flex items-center justify-center hover:bg-red-50 text-red-600"
                          >
                            -
                          </button>
                          <span className="w-6 text-center select-none font-black text-xs">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.menuItem, item.portionType, item.quantity + 1)}
                            className="w-6 h-full flex items-center justify-center hover:bg-red-50 text-red-600"
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeCartItem(item.menuItem, item.portionType)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {cartItems.length === 0 && (
                    <div className="text-center py-20 text-neutral-400 text-sm">
                      Cart is empty. Add items from the menu.
                    </div>
                  )}
                </div>

                {/* Cart Subtotal and Submit */}
                <div className="p-4 bg-white border-t border-neutral-150 space-y-4">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="text-neutral-800 font-black text-base">₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  
                  <button
                    disabled={cartItems.length === 0 || submittingOrder}
                    onClick={submitWaiterOrder}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-sm transition active:scale-95 text-center"
                  >
                    {submittingOrder ? "Placing Order..." : "Confirm & Place Order"}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
