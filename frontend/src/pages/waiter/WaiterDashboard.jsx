import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUtensils, FaSyncAlt, FaSignOutAlt, FaConciergeBell, FaCheck, FaBan, FaCheckCircle, FaTrash, FaPlus, FaBroom, FaPrint } from "react-icons/fa";
import { getTables, updateTableStatus } from "../../services/tableService";
import { updateOrderStatus } from "../../services/orderService";
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
          <h2>CAFE RECEIPT</h2>
          <div class="center" style="font-size: 12px; margin-bottom: 10px;">
            Table: ${order.tableNumber}<br>
            Date: ${new Date(order.createdAt).toLocaleString()}<br>
            Order ID: ${order._id.substring(0, 8)}...
          </div>
          <pre>
Item Name     Qty     Price
---------------------------
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

  return (
    <section className="min-h-screen bg-black text-white px-4 py-8 sm:px-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,.06),transparent_45%)] pointer-events-none" />

      {/* Header */}
      <header className="relative mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-gold-400 font-bold">
            <FaConciergeBell /> Waiter Control Panel
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Tables & Billings</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:text-gold-400 hover:bg-white/10 transition-all">
            <FaSyncAlt /> Refresh
          </button>
          <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        
        {/* Active Tables Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Tables Overview</h2>
          
          {loading && tables.length === 0 ? (
            <div className="flex justify-center items-center py-20 text-white/55">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
              {tables.map((table) => {
                const isSelected = selectedTable?._id === table._id;
                const statusStyles = {
                  available: "border-green-500/20 bg-green-500/[0.02] text-green-400",
                  occupied: "border-red-500/25 bg-red-500/[0.02] text-red-400",
                  cleaning: "border-amber-500/20 bg-amber-500/[0.02] text-amber-400",
                  reserved: "border-blue-500/20 bg-blue-500/[0.02] text-blue-400"
                };

                return (
                  <motion.div
                    key={table._id}
                    onClick={() => setSelectedTable(table)}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className={`cursor-pointer rounded-3xl border p-5 flex flex-col justify-between min-h-36 transition-all shadow-lg ${
                      isSelected ? "border-gold-400 ring-2 ring-gold-400/20" : statusStyles[table.status] || "border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs uppercase tracking-wider font-semibold opacity-60">Table</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-current bg-white/5`}>
                          {table.status}
                        </span>
                      </div>
                      <p className="mt-2 text-3xl font-black tracking-tight text-white">{table.number}</p>
                    </div>

                    {table.activeOrder && (
                      <div className="mt-4 border-t border-white/5 pt-2 text-xs text-white/60">
                        <p className="font-bold text-gold-400">₹{table.activeOrder.total?.toFixed(2)}</p>
                        <p className="truncate text-[10px] opacity-75">{table.activeOrder.status}</p>
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
          <h2 className="text-xl font-bold tracking-tight">Active Billing Panel</h2>
          
          <AnimatePresence mode="wait">
            {selectedTable ? (
              <motion.div
                key={selectedTable._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl space-y-6 shadow-2xl"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-2xl font-black">Table {selectedTable.number}</h3>
                    <p className="text-xs text-white/50">Configure status and orders</p>
                  </div>
                  
                  {/* Quick table status change */}
                  <div className="flex gap-2">
                    {["available", "cleaning", "reserved"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleTableStatusChange(selectedTable._id, st)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border capitalize transition-all ${
                          selectedTable.status === st
                            ? "border-gold-400 bg-gold-400/10 text-gold-400"
                            : "border-white/10 bg-white/5 text-white/65 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTable.activeOrder ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start bg-black/40 border border-white/5 p-4 rounded-2xl">
                      <div>
                        <p className="text-xs text-white/40">Active Order ID</p>
                        <p className="font-mono text-sm text-white/80">{selectedTable.activeOrder._id}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <StatusBadge status={selectedTable.activeOrder.status} />
                          <span className="text-[10px] text-white/45">
                            {new Date(selectedTable.activeOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      <span className="text-xl font-black text-gold-400">₹{selectedTable.activeOrder.total?.toFixed(2)}</span>
                    </div>

                    {/* Ordered Items List */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-white/70">Ordered Items</p>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {selectedTable.activeOrder.items?.map((item) => (
                          <div key={item._id || item.menuItem} className="flex justify-between items-center text-sm bg-black/20 p-3 rounded-xl border border-white/5">
                            <div>
                              <p className="font-bold text-white">{item.name}</p>
                              <p className="text-xs text-white/40">
                                Qty: {item.quantity} {item.portionType !== "single" && `· ${item.portionType}`}
                              </p>
                            </div>
                            <span className="font-bold text-gold-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Print Bill Action */}
                    <div className="border-t border-white/10 pt-4">
                      <button
                        onClick={() => handlePrintBill(selectedTable.activeOrder)}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gold-400/30 bg-gold-400/5 py-3 text-sm font-bold text-gold-400 hover:bg-gold-400/10 transition-all active:scale-95"
                      >
                        <FaPrint /> Print Bill / Receipt
                      </button>
                    </div>

                    {/* Quick billing status actions */}
                    <div className="border-t border-white/10 pt-4 space-y-3">
                      <p className="text-xs uppercase tracking-wider font-semibold text-white/50">Order Status Control</p>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTable.activeOrder.status === "Ready" && (
                          <button
                            onClick={() => handleOrderStatusChange(selectedTable.activeOrder._id, "Served")}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/20 active:scale-95 transition-transform hover:bg-green-500"
                          >
                            <FaCheck /> Mark Served
                          </button>
                        )}
                        {(selectedTable.activeOrder.status === "Served" || selectedTable.activeOrder.status === "Completed") && (
                          <button
                            onClick={() => handleOrderStatusChange(selectedTable.activeOrder._id, "Paid")}
                            className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform hover:bg-emerald-500"
                          >
                            <FaCheckCircle /> Mark Paid (Free Table)
                          </button>
                        )}
                        {["Pending", "Accepted", "Cooking"].includes(selectedTable.activeOrder.status) && (
                          <button
                            onClick={() => handleOrderStatusChange(selectedTable.activeOrder._id, "Cancelled")}
                            className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <FaBan /> Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-white/45 space-y-3 bg-black/20 rounded-3xl border border-dashed border-white/10">
                    <FaUtensils className="mx-auto text-4xl text-white/30" />
                    <div>
                      <p className="font-bold text-white">No Active Order</p>
                      <p className="text-xs text-white/40 mt-1">This table is currently not serving any guests.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center text-white/45 shadow-xl">
                Select a table from the overview to manage billing, configure status, or execute payment controls.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
