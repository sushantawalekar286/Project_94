import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../services/orderService";
import StatusBadge from "../../components/chef/StatusBadge";
import { FaClock, FaUtensils, FaSearch, FaUser, FaChevronLeft, FaChevronRight, FaPrint, FaBan, FaCheck, FaSync, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import ManualOrderModal from "../../components/common/ManualOrderModal";

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchOrders = () => {
    setLoading(true);
    getOrders()
      .then((res) => {
        const arrayData = res.data?.data || res.data || [];
        setOrders(Array.isArray(arrayData) ? arrayData : []);
      })
      .catch((err) => {
        console.error("[OrdersManagement] Error fetching orders:", err);
        setOrders([]);
        toast.error("Failed to load orders");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by search and status filter tabs
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      String(order.tableNumber).includes(search) || 
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      order.status.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${order._id.substring(order._id.length - 6).toUpperCase()}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              max-width: 380px;
              margin: 0 auto;
              background: white;
              color: black;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed black;
              padding-bottom: 15px;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              margin: 0;
            }
            .details {
              margin: 15px 0;
              font-size: 12px;
              line-height: 1.6;
            }
            .table-items {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .table-items th, .table-items td {
              text-align: left;
              font-size: 12px;
              padding: 5px 0;
            }
            .table-items th {
              border-bottom: 1px dashed black;
            }
            .totals {
              border-top: 1px dashed black;
              margin-top: 15px;
              padding-top: 10px;
              font-size: 12px;
              line-height: 1.8;
            }
            .footer {
              text-align: center;
              font-size: 11px;
              margin-top: 30px;
              border-top: 1px dashed black;
              padding-top: 15px;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h1 class="title">94 CAFE & CHINESE</h1>
            <p style="font-size: 11px; margin: 5px 0 0 0;">Table QR Self-Order System</p>
          </div>
          <div class="details">
            <div>Order ID: #${order._id.toUpperCase()}</div>
            <div>Table: Table ${order.tableNumber}</div>
            <div>Date: ${new Date(order.createdAt).toLocaleString()}</div>
            <div>Status: ${order.status}</div>
          </div>
          <table class="table-items">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name} ${item.portionType !== 'single' ? `(${item.portionType})` : ''}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal</span>
              <span>₹${(order.subtotal || order.total).toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Discount</span>
              <span>-₹${order.discount.toFixed(2)}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px;">
              <span>Total Paid</span>
              <span>₹${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Please visit again ✨</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filterTabs = ["All", "Pending", "Cooking", "Ready", "Served", "Completed", "Cancelled"];

  return (
    <section className="px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6 text-neutral-800">
      
      {/* Header and Controls */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-neutral-200/60 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">
            94 Cafe & Chinese Audit Trail
          </p>
          <h1 className="mt-1 text-3xl font-black text-neutral-800 leading-tight tracking-tight">
            Orders Management
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:max-w-md justify-end">
          {/* Place Order button */}
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white py-3 px-5 text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95 whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <FaPlus /> Place Order
          </button>

          {/* Search Bar */}
          <div className="relative w-full sm:max-w-xs">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-colors duration-200 font-semibold shadow-sm"
              placeholder="Search Table #, Status, or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center bg-white border border-neutral-200 p-2 rounded-2xl shadow-sm overflow-x-auto scrollbar-thin">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
              statusFilter === tab
                ? "bg-red-600 text-white shadow-sm"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
            }`}
          >
            {tab}
          </button>
        ))}
        <button
          onClick={fetchOrders}
          className="ml-auto p-2 rounded-xl text-neutral-400 hover:bg-neutral-50 hover:text-red-600 transition"
          title="Refresh Data"
        >
          <FaSync className={loading ? "animate-spin" : ""} size={12} />
        </button>
      </div>

      {/* Orders List Grid */}
      <div className="grid gap-5">
        {loading && orders.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 font-bold flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            <span className="text-xs">Loading order audit trail...</span>
          </div>
        ) : paginatedOrders.map((order) => {
          const isPending = order.status === "Pending";
          const isCooking = order.status === "Cooking";
          const isReady = order.status === "Ready";
          const isServed = order.status === "Served";

          return (
            <article key={order._id} className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-red-500/10 transition-colors">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-neutral-100 pb-4">
                
                {/* Meta details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1 ml-1">
                      <FaClock size={10} /> {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-semibold hidden sm:inline">
                      ({new Date(order.createdAt).toLocaleDateString()})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <h2 className="text-base font-black text-neutral-800 flex items-center gap-1.5">
                      <FaUtensils className="text-red-600 text-xs" /> Table {order.tableNumber}
                    </h2>
                    <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                      <FaUser size={10} className="text-neutral-400" /> Guest Customer
                    </span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="self-start sm:self-center">
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Items Summary Grid */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {order.items?.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-2xl border border-neutral-150 bg-neutral-50/50 px-4 py-3 text-xs font-bold text-neutral-700 flex justify-between items-center"
                  >
                    <span className="truncate pr-2">
                      {item.name} {item.portionType && item.portionType !== 'single' ? `(${item.portionType})` : ''}
                    </span>
                    <span className="text-red-600 bg-red-50 border border-red-100/50 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Details (Total & Admin Actions) */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-100 pt-4">
                
                {/* Total amount representation */}
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Grand Total</span>
                  <p className="text-xl font-black text-red-600 tracking-tight">₹{(order.total || 0).toFixed(2)}</p>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Print invoice button */}
                  <button 
                    onClick={() => handlePrintInvoice(order)} 
                    className="flex items-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider py-2.5 px-4 bg-neutral-50 hover:bg-neutral-100/50 text-neutral-600 border border-neutral-200 shadow-sm transition"
                    title="Print Invoice"
                  >
                    <FaPrint /> Print
                  </button>

                  {/* Dynamic Workflow Actions */}
                  {isPending && (
                    <>
                      <button 
                        disabled={updatingId === order._id}
                        onClick={() => handleStatusUpdate(order._id, "Accepted")}
                        className="flex items-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider py-2.5 px-4 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition"
                      >
                        <FaCheck /> Accept
                      </button>
                      <button 
                        disabled={updatingId === order._id}
                        onClick={() => handleStatusUpdate(order._id, "Cancelled")}
                        className="flex items-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider py-2.5 px-4 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition"
                      >
                        <FaBan /> Cancel
                      </button>
                    </>
                  )}

                  {isCooking && (
                    <button 
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusUpdate(order._id, "Ready")}
                      className="flex items-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm hover:scale-105 active:scale-95 transition"
                    >
                      <FaCheck /> Ready to Serve
                    </button>
                  )}

                  {isReady && (
                    <button 
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusUpdate(order._id, "Served")}
                      className="flex items-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm hover:scale-105 active:scale-95 transition"
                    >
                      <FaCheck /> Confirm Served
                    </button>
                  )}

                  {isServed && (
                    <button 
                      disabled={updatingId === order._id}
                      onClick={() => handleStatusUpdate(order._id, "Completed")}
                      className="flex items-center gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-105 active:scale-95 transition"
                    >
                      <FaCheck /> Complete & Pay
                    </button>
                  )}

                </div>
              </div>
            </article>
          );
        })}

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && (
          <div className="text-center border border-dashed border-neutral-200 rounded-3xl p-16 bg-white space-y-4">
            <h3 className="text-lg font-black text-neutral-800">No matching orders found</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              We couldn't find any orders matching filter status "<strong>{statusFilter}</strong>" or search criteria.
            </p>
            <button
              onClick={() => { setSearch(""); setStatusFilter("All"); }}
              className="px-5 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider border border-neutral-200 transition shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <footer className="flex items-center justify-between border-t border-neutral-200/60 pt-6">
          <p className="text-xs text-neutral-400 font-bold">
            Showing <strong className="text-neutral-700 font-black">{startIndex + 1}</strong> to <strong className="text-neutral-700 font-black">{endIndex}</strong> of <strong className="text-neutral-700 font-black">{totalItems}</strong> entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaChevronLeft size={10} />
            </button>
            
            <span className="px-3 text-xs font-black text-neutral-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FaChevronRight size={10} />
            </button>
          </div>
        </footer>
      )}

      <ManualOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={fetchOrders}
      />
    </section>
  );
}
