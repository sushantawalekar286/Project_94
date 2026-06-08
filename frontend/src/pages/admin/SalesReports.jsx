import { useEffect, useMemo, useState } from "react";
import { 
  FaCalendarAlt, FaFileExcel, FaFilePdf, FaCoins, FaClipboardList, 
  FaUtensils, FaCreditCard, FaTable, FaSearch, FaChartLine, 
  FaSyncAlt, FaChartBar, FaAward, FaArrowUp, FaTags 
} from "react-icons/fa";
import { getSalesReport } from "../../services/salesService";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

export default function SalesReports() {
  const [filterType, setFilterType] = useState("last7"); // "today", "yesterday", "last7", "last30", "thisMonth", "thisYear", "custom"
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("revenue"); // "revenue", "orders", "monthly"
  const [detailTab, setDetailTab] = useState("revenue"); // "revenue", "orders", "products", "payments", "tables"

  // Pre-calculate date strings
  const getDatesForFilter = (type, customStart = "", customEnd = "") => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "last7":
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "last30":
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "custom":
        if (customStart && customEnd) {
          start = new Date(customStart);
          start.setHours(0, 0, 0, 0);
          end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
        }
        break;
      default:
        break;
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  };

  // Sync dates with filters
  useEffect(() => {
    if (filterType !== "custom") {
      const dates = getDatesForFilter(filterType);
      setDateRange({
        startDate: dates.startDate.split("T")[0],
        endDate: dates.endDate.split("T")[0]
      });
    }
  }, [filterType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const dates = getDatesForFilter(
        filterType, 
        dateRange.startDate, 
        dateRange.endDate
      );
      const res = await getSalesReport(dates.startDate, dates.endDate);
      setReportData(res.data);
    } catch (err) {
      console.error("[SalesReports] Fetch failed:", err);
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchReport();
    }
  }, [dateRange, filterType]);

  // Excel Export Handler
  const downloadExcel = () => {
    if (!reportData) return;
    
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary Cards
      const summaryAOA = [
        ["94 Cafe & Chinese - Management Report"],
        ["Date Range", `${dateRange.startDate} to ${dateRange.endDate}`],
        [],
        ["Metric", "Value"],
        ["Total Revenue (Selected Period)", reportData.summary.totalRevenue],
        ["Total Orders (Selected Period)", reportData.summary.totalOrders],
        ["Average Order Value (AOV)", reportData.summary.avgOrderValue],
        ["Total Paid Orders", reportData.summary.totalPaidOrders],
        ["Total Unpaid Orders", reportData.summary.totalUnpaidOrders],
        [],
        ["Today's Revenue", reportData.summary.totalRevenueToday],
        ["Today's Orders", reportData.summary.totalOrdersToday],
        ["This Week's Revenue", reportData.summary.totalRevenueThisWeek],
        ["This Week's Orders", reportData.summary.totalOrdersThisWeek],
        ["This Month's Revenue", reportData.summary.totalRevenueThisMonth],
        ["This Month's Orders", reportData.summary.totalOrdersThisMonth]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryAOA);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Overview Statistics");

      // Sheet 2: Daily Sales Details
      const dailyAOA = [
        ["Date", "Orders Count", "Revenue", "Tax Collected", "Discounts"]
      ];
      reportData.revenue.daily.forEach(d => {
        dailyAOA.push([d._id, d.ordersCount, d.revenue, d.taxCollected, d.discounts]);
      });
      const wsDaily = XLSX.utils.aoa_to_sheet(dailyAOA);
      XLSX.utils.book_append_sheet(wb, wsDaily, "Daily Revenue");

      // Sheet 3: Weekly & Monthly Sales Details
      const weeklyAOA = [["Week Number", "Orders", "Revenue"]];
      reportData.revenue.weekly.forEach(w => {
        weeklyAOA.push([w._id, w.orders, w.revenue]);
      });
      const wsWeekly = XLSX.utils.aoa_to_sheet(weeklyAOA);
      XLSX.utils.book_append_sheet(wb, wsWeekly, "Weekly Revenue");

      const monthlyAOA = [["Month", "Orders", "Revenue"]];
      reportData.revenue.monthly.forEach(m => {
        monthlyAOA.push([m._id, m.orders, m.revenue]);
      });
      const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyAOA);
      XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Revenue");

      // Sheet 4: Product Analytics
      const productAOA = [
        ["Best Selling Items", "", "", "Worst Selling Items"],
        ["Item Name", "Quantity Sold", "Revenue Generated", "Item Name", "Quantity Sold"]
      ];
      const maxLen = Math.max(reportData.products.bestSelling.length, reportData.products.worstSelling.length);
      for (let i = 0; i < maxLen; i++) {
        const best = reportData.products.bestSelling[i] || { _id: "", quantitySold: "", revenueGenerated: "" };
        const worst = reportData.products.worstSelling[i] || { _id: "", quantitySold: "" };
        productAOA.push([best._id, best.quantitySold, best.revenueGenerated, worst._id, worst.quantitySold]);
      }
      const wsProducts = XLSX.utils.aoa_to_sheet(productAOA);
      XLSX.utils.book_append_sheet(wb, wsProducts, "Product Performance");

      // Sheet 5: Category & Table Performance
      const catTableAOA = [
        ["Category Performance", "", "", "Table Performance"],
        ["Category Name", "Orders Count", "Revenue", "Table Number", "Total Orders", "Revenue Generated", "Average Bill Value"]
      ];
      const maxCatTableLen = Math.max(reportData.products.categoryPerformance.length, reportData.tables.length);
      for (let i = 0; i < maxCatTableLen; i++) {
        const cat = reportData.products.categoryPerformance[i] || { _id: "", ordersCount: "", revenue: "" };
        const tab = reportData.tables[i] || { tableNumber: "", totalOrders: "", revenueGenerated: "", averageBillValue: "" };
        catTableAOA.push([
          cat._id, cat.ordersCount, cat.revenue,
          tab.tableNumber, tab.totalOrders, tab.revenueGenerated, tab.averageBillValue
        ]);
      }
      const wsCatTable = XLSX.utils.aoa_to_sheet(catTableAOA);
      XLSX.utils.book_append_sheet(wb, wsCatTable, "Category & Table Stats");

      // Sheet 6: Payment Methods Used
      const payAOA = [
        ["Payment Method", "Transaction Count", "Amount Collected"]
      ];
      reportData.payments.methods.forEach(m => {
        payAOA.push([m._id || "Other", m.count, m.amount]);
      });
      const wsPayments = XLSX.utils.aoa_to_sheet(payAOA);
      XLSX.utils.book_append_sheet(wb, wsPayments, "Payments Breakdown");

      XLSX.writeFile(wb, `Cafe_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
      toast.success("Excel report exported successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate Excel sheet");
    }
  };

  // PDF Export Handler
  const downloadPDF = () => {
    if (!reportData) return;

    try {
      const doc = new jsPDF();
      let y = 15;

      // Header Band
      doc.setFillColor(185, 28, 28); // Tailwind red-700
      doc.rect(0, 0, 210, 35, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("94 CAFE & CHINESE", 15, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("MANAGEMENT PERFORMANCE AUDIT & SALES SUMMARY", 15, 24);
      doc.text(`Report Range: ${dateRange.startDate} to ${dateRange.endDate}`, 15, 29);

      doc.setTextColor(50, 50, 50);
      y = 45;

      // Section 1: Summary Statistics
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("1. SUMMARY METRICS", 15, y);
      doc.line(15, y + 2, 195, y + 2);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const sum = reportData.summary;

      const metricsCol1 = [
        `Revenue (Filtered Range): INR ${sum.totalRevenue.toFixed(2)}`,
        `Orders Count (Filtered Range): ${sum.totalOrders}`,
        `Average Order Value (AOV): INR ${sum.avgOrderValue.toFixed(2)}`,
        `Paid Orders Count: ${sum.totalPaidOrders}`,
        `Unpaid / Pending Orders: ${sum.totalUnpaidOrders}`
      ];

      const metricsCol2 = [
        `Today's Sales Total: INR ${sum.totalRevenueToday.toFixed(2)}`,
        `Today's Order Count: ${sum.totalOrdersToday}`,
        `Weekly Sales Turnover: INR ${sum.totalRevenueThisWeek.toFixed(2)}`,
        `Weekly Order Count: ${sum.totalOrdersThisWeek}`,
        `Monthly Sales Turnover: INR ${sum.totalRevenueThisMonth.toFixed(2)}`
      ];

      for (let i = 0; i < metricsCol1.length; i++) {
        doc.text(metricsCol1[i], 15, y + (i * 5.5));
        doc.text(metricsCol2[i] || "", 115, y + (i * 5.5));
      }

      y += 35;

      // Section 2: Best Selling Items
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. BEST SELLING MENU ITEMS", 15, y);
      doc.line(15, y + 2, 195, y + 2);
      y += 10;

      doc.setFontSize(9.5);
      doc.text("Item Name", 15, y);
      doc.text("Quantity Sold", 110, y);
      doc.text("Revenue Generated", 160, y);
      doc.line(15, y + 2, 195, y + 2);
      y += 7;

      doc.setFont("helvetica", "normal");
      reportData.products.bestSelling.slice(0, 8).forEach(item => {
        doc.text(item._id, 15, y);
        doc.text(String(item.quantitySold), 110, y);
        doc.text(`INR ${item.revenueGenerated.toFixed(2)}`, 160, y);
        y += 5.5;
      });

      y += 10;

      // Section 3: Payment Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("3. PAYMENTS & COLLECTION OVERVIEW", 15, y);
      doc.line(15, y + 2, 195, y + 2);
      y += 10;

      doc.setFontSize(9.5);
      doc.text("Payment Type / Gateway", 15, y);
      doc.text("Transaction Count", 110, y);
      doc.text("Amount Received", 160, y);
      doc.line(15, y + 2, 195, y + 2);
      y += 7;

      doc.setFont("helvetica", "normal");
      reportData.payments.methods.forEach(method => {
        doc.text(method._id || "Other Method", 15, y);
        doc.text(String(method.count), 110, y);
        doc.text(`INR ${method.amount.toFixed(2)}`, 160, y);
        y += 5.5;
      });

      y += 10;

      // Section 4: Table Performance
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("4. TABLE VISIT & TURNOVER STATISTICS", 15, y);
      doc.line(15, y + 2, 195, y + 2);
      y += 10;

      doc.setFontSize(9.5);
      doc.text("Table #", 15, y);
      doc.text("Orders Served", 60, y);
      doc.text("Total Revenue", 110, y);
      doc.text("Avg Order Size", 160, y);
      doc.line(15, y + 2, 195, y + 2);
      y += 7;

      doc.setFont("helvetica", "normal");
      reportData.tables.slice(0, 6).forEach(table => {
        doc.text(`Table ${table.tableNumber}`, 15, y);
        doc.text(String(table.totalOrders), 60, y);
        doc.text(`INR ${table.revenueGenerated.toFixed(2)}`, 110, y);
        doc.text(`INR ${table.averageBillValue.toFixed(2)}`, 160, y);
        y += 5.5;
      });

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(`Generated automatically by 94 Cafe System on ${new Date().toLocaleString()}`, 15, 285);

      doc.save(`Cafe_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`);
      toast.success("PDF report generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF document");
    }
  };

  // Highlights calculations
  const highlights = useMemo(() => {
    if (!reportData || reportData.tables.length === 0) return { activeTable: "None", highestRevenueTable: "None" };
    
    // Sort tables by order count
    const sortedActive = [...reportData.tables].sort((a, b) => b.totalOrders - a.totalOrders);
    // Sort tables by revenue
    const sortedRevenue = [...reportData.tables].sort((a, b) => b.revenueGenerated - a.revenueGenerated);

    return {
      activeTable: sortedActive[0] ? `Table ${sortedActive[0].tableNumber} (${sortedActive[0].totalOrders} orders)` : "None",
      highestRevenueTable: sortedRevenue[0] ? `Table ${sortedRevenue[0].tableNumber} (₹${sortedRevenue[0].revenueGenerated.toFixed(2)})` : "None"
    };
  }, [reportData]);

  if (loading && !reportData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-neutral-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        <span className="ml-3 font-bold text-xs">Loading admin reports data...</span>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#FAF9F6] px-4 py-8 text-neutral-800 sm:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Upper Brand Header / Filters */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-neutral-200/60 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">
            Cafe & Chinese Sales Auditing
          </p>
          <h1 className="mt-1 text-3xl font-black text-neutral-800 leading-tight tracking-tight">
            Financial & Performance Reports
          </h1>
        </div>

        {/* Dynamic Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Range select */}
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 p-1 rounded-2xl shadow-sm">
            <FaCalendarAlt className="text-neutral-400 ml-2.5 mr-1" size={12} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-0 text-xs font-black text-neutral-700 focus:outline-none focus:ring-0 pr-6 py-1.5"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Picker Inputs */}
          {filterType === "custom" && (
            <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-1.5 rounded-2xl shadow-sm">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-transparent text-xs font-bold text-neutral-800 border-0 focus:outline-none focus:ring-0 p-0"
              />
              <span className="text-neutral-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-transparent text-xs font-bold text-neutral-800 border-0 focus:outline-none focus:ring-0 p-0"
              />
            </div>
          )}

          {/* Export Controls */}
          <div className="flex gap-2">
            <button 
              onClick={downloadExcel}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-sm transition active:scale-95"
            >
              <FaFileExcel /> Download Excel
            </button>
            <button 
              onClick={downloadPDF}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 text-xs shadow-sm transition active:scale-95"
            >
              <FaFilePdf /> Download PDF
            </button>
            <button 
              onClick={fetchReport}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 px-3 py-2.5 text-xs font-bold shadow-sm transition"
              title="Force Refresh Data"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      {/* Grid of Summary Cards */}
      {reportData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          {/* Revenue metrics cards */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Revenue Today</span>
              <FaCoins className="text-red-500 text-sm" />
            </div>
            <p className="mt-2 text-2xl font-black text-neutral-800">₹{reportData.summary.totalRevenueToday.toFixed(2)}</p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Today's total sales</p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Revenue This Week</span>
              <FaCoins className="text-red-500 text-sm" />
            </div>
            <p className="mt-2 text-2xl font-black text-neutral-800">₹{reportData.summary.totalRevenueThisWeek.toFixed(2)}</p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Last 7 Days total sales</p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Revenue This Month</span>
              <FaCoins className="text-red-500 text-sm" />
            </div>
            <p className="mt-2 text-2xl font-black text-neutral-800">₹{reportData.summary.totalRevenueThisMonth.toFixed(2)}</p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Current month sales</p>
          </div>

          {/* Volume stats cards */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Orders Today</span>
              <FaClipboardList className="text-red-500 text-sm" />
            </div>
            <p className="mt-2 text-2xl font-black text-neutral-800">{reportData.summary.totalOrdersToday}</p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Today's order volume</p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Orders This Week</span>
              <FaClipboardList className="text-red-500 text-sm" />
            </div>
            <p className="mt-2 text-2xl font-black text-neutral-800">{reportData.summary.totalOrdersThisWeek}</p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Last 7 Days order volume</p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Orders This Month</span>
              <FaClipboardList className="text-red-500 text-sm" />
            </div>
            <p className="mt-2 text-2xl font-black text-neutral-800">{reportData.summary.totalOrdersThisMonth}</p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Current month order volume</p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Average Order Value</span>
              <FaChartLine className="text-red-500 text-sm" />
            </div>
            <p className="mt-2 text-2xl font-black text-neutral-800">₹{reportData.summary.avgOrderValue.toFixed(2)}</p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Mean turnover per invoice</p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Paid vs Unpaid Orders</span>
              <FaCreditCard className="text-red-500 text-sm" />
            </div>
            <p className="mt-2 text-2xl font-black text-neutral-800">
              {reportData.summary.totalPaidOrders} <span className="text-xs text-neutral-400 font-bold">paid</span> / {reportData.summary.totalUnpaidOrders} <span className="text-xs text-neutral-400 font-bold">unpaid</span>
            </p>
            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Payment clearance status</p>
          </div>

        </div>
      )}

      {/* Middle Section: Chart Layout */}
      {reportData && (
        <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base font-black text-neutral-800 tracking-tight flex items-center gap-1.5">
                <FaChartBar className="text-red-600" size={14} /> Reports Visualization Charts
              </h2>
              <p className="text-[10px] text-neutral-400 font-bold mt-1">Daily stats analysis for the selected range</p>
            </div>

            {/* Toggle Graph representation */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 self-start">
              <button 
                onClick={() => setChartType("revenue")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                  chartType === "revenue" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Revenue Trend
              </button>
              <button 
                onClick={() => setChartType("orders")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                  chartType === "orders" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Order Trend
              </button>
              <button 
                onClick={() => setChartType("monthly")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                  chartType === "monthly" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Monthly Growth
              </button>
            </div>
          </div>

          {/* Bar Graph container */}
          <div className="mt-8 flex h-72 items-end gap-2 sm:gap-4 overflow-x-auto scrollbar-thin pb-2 px-2">
            
            {/* 1. REVENUE TREND */}
            {chartType === "revenue" && reportData.revenue.daily.map((day, idx) => {
              const maxVal = Math.max(...reportData.revenue.daily.map(d => d.revenue || 1), 1);
              const height = (day.revenue / maxVal) * 100;
              return (
                <div key={idx} className="flex min-w-[42px] flex-1 flex-col items-center gap-2 group relative cursor-pointer">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-red-600 to-red-400 transition-all hover:brightness-105 shadow-sm" 
                    style={{ height: `${Math.max(height, 6)}%` }} 
                  />
                  <span className="text-[9px] text-neutral-400 font-bold">{day._id.slice(-5)}</span>
                  <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform duration-100 bg-neutral-900 text-white p-2 rounded-xl text-[9px] text-center z-10 w-max border border-neutral-800 shadow-md">
                    <p className="font-bold text-red-400">₹{day.revenue.toFixed(2)}</p>
                    <p className="text-[8px] text-neutral-400">{day._id}</p>
                  </div>
                </div>
              );
            })}

            {/* 2. ORDER TREND */}
            {chartType === "orders" && reportData.revenue.daily.map((day, idx) => {
              const maxVal = Math.max(...reportData.revenue.daily.map(d => d.ordersCount || 1), 1);
              const height = (day.ordersCount / maxVal) * 100;
              return (
                <div key={idx} className="flex min-w-[42px] flex-1 flex-col items-center gap-2 group relative cursor-pointer">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:brightness-105 shadow-sm" 
                    style={{ height: `${Math.max(height, 6)}%` }} 
                  />
                  <span className="text-[9px] text-neutral-400 font-bold">{day._id.slice(-5)}</span>
                  <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform duration-100 bg-neutral-900 text-white p-2 rounded-xl text-[9px] text-center z-10 w-max border border-neutral-800 shadow-md">
                    <p className="font-bold text-blue-400">{day.ordersCount} Orders</p>
                    <p className="text-[8px] text-neutral-400">{day._id}</p>
                  </div>
                </div>
              );
            })}

            {/* 3. MONTHLY GROWTH */}
            {chartType === "monthly" && reportData.revenue.monthly.map((month, idx) => {
              const maxVal = Math.max(...reportData.revenue.monthly.map(m => m.revenue || 1), 1);
              const height = (month.revenue / maxVal) * 100;
              return (
                <div key={idx} className="flex min-w-[64px] flex-1 flex-col items-center gap-2 group relative cursor-pointer">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all hover:brightness-105 shadow-sm" 
                    style={{ height: `${Math.max(height, 6)}%` }} 
                  />
                  <span className="text-[9px] text-neutral-400 font-bold">{month._id}</span>
                  <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform duration-100 bg-neutral-900 text-white p-2 rounded-xl text-[9px] text-center z-10 w-max border border-neutral-800 shadow-md">
                    <p className="font-bold text-indigo-400">₹{month.revenue.toFixed(2)}</p>
                    <p className="text-[8px] text-neutral-400">{month.orders} orders</p>
                  </div>
                </div>
              );
            })}

            {chartType === "monthly" && reportData.revenue.monthly.length === 0 && (
              <div className="w-full text-center text-neutral-400 py-16 font-bold text-xs">No monthly turnover recorded.</div>
            )}
            {chartType === "revenue" && reportData.revenue.daily.length === 0 && (
              <div className="w-full text-center text-neutral-400 py-16 font-bold text-xs">No daily revenue trends.</div>
            )}

          </div>
        </div>
      )}

      {/* Bottom Section: Detailed Reports Table Selection */}
      {reportData && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Table view */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
            {/* Table tabs */}
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200 overflow-x-auto">
              <button 
                onClick={() => setDetailTab("revenue")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  detailTab === "revenue" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <FaCoins /> Revenue Reports
              </button>
              <button 
                onClick={() => setDetailTab("orders")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  detailTab === "orders" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <FaClipboardList /> Order Reports
              </button>
              <button 
                onClick={() => setDetailTab("products")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  detailTab === "products" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <FaUtensils /> Product Reports
              </button>
              <button 
                onClick={() => setDetailTab("payments")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  detailTab === "payments" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <FaCreditCard /> Payment Reports
              </button>
              <button 
                onClick={() => setDetailTab("tables")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  detailTab === "tables" ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <FaTable /> Table Reports
              </button>
            </div>

            {/* Rendered content */}
            <div className="pt-2 min-h-64">
              <AnimatePresence mode="wait">
                
                {/* 1. REVENUE REPORTS DETAILS */}
                {detailTab === "revenue" && (
                  <motion.div key="revenue-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-neutral-800">Daily Revenue Performance</h3>
                      <div className="overflow-x-auto mt-3 border border-neutral-100 rounded-2xl">
                        <table className="w-full text-left text-xs font-bold text-neutral-500">
                          <thead className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                            <tr>
                              <th className="p-3">Date</th>
                              <th className="p-3 text-center">Orders</th>
                              <th className="p-3 text-right">Tax Collected</th>
                              <th className="p-3 text-right">Discounts</th>
                              <th className="p-3 text-right">Net Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {reportData.revenue.daily.map((day, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50/50">
                                <td className="p-3 font-black text-neutral-850">{day._id}</td>
                                <td className="p-3 text-center font-semibold text-neutral-600">{day.ordersCount}</td>
                                <td className="p-3 text-right font-semibold text-neutral-600">₹{day.taxCollected.toFixed(2)}</td>
                                <td className="p-3 text-right font-semibold text-neutral-600">₹{day.discounts.toFixed(2)}</td>
                                <td className="p-3 text-right font-black text-red-600 font-mono">₹{day.revenue.toFixed(2)}</td>
                              </tr>
                            ))}
                            {reportData.revenue.daily.length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-neutral-400">No records found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-neutral-800">Monthly Turnovers</h3>
                      <div className="overflow-x-auto mt-3 border border-neutral-100 rounded-2xl">
                        <table className="w-full text-left text-xs font-bold text-neutral-500">
                          <thead className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                            <tr>
                              <th className="p-3">Month</th>
                              <th className="p-3 text-center">Total Bills</th>
                              <th className="p-3 text-right">Revenue Generated</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {reportData.revenue.monthly.map((m, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50/50">
                                <td className="p-3 font-black text-neutral-850">{m._id}</td>
                                <td className="p-3 text-center font-semibold text-neutral-600">{m.orders}</td>
                                <td className="p-3 text-right font-black text-red-600 font-mono">₹{m.revenue.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. ORDER REPORTS SUMMARY */}
                {detailTab === "orders" && (
                  <motion.div key="orders-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h3 className="text-sm font-black text-neutral-800">Order Volumes By Kitchen Status</h3>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 mt-3">
                      <div className="p-4 border border-neutral-100 bg-neutral-50/50 rounded-2xl">
                        <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Total Orders Placed</span>
                        <p className="mt-1.5 text-xl font-black text-neutral-800">{reportData.orders.total}</p>
                      </div>
                      <div className="p-4 border border-green-100 bg-green-50/20 rounded-2xl">
                        <span className="text-[10px] uppercase font-black tracking-wider text-green-600">Completed Orders</span>
                        <p className="mt-1.5 text-xl font-black text-green-700">{reportData.orders.completed}</p>
                      </div>
                      <div className="p-4 border border-amber-100 bg-amber-50/20 rounded-2xl">
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-600">Pending Orders</span>
                        <p className="mt-1.5 text-xl font-black text-amber-700">{reportData.orders.pending}</p>
                      </div>
                      <div className="p-4 border border-red-100 bg-red-50/20 rounded-2xl">
                        <span className="text-[10px] uppercase font-black tracking-wider text-red-600">Cancelled Orders</span>
                        <p className="mt-1.5 text-xl font-black text-red-700">{reportData.orders.cancelled}</p>
                      </div>
                      <div className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-2xl">
                        <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600">Served Orders</span>
                        <p className="mt-1.5 text-xl font-black text-emerald-700">{reportData.orders.served}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. PRODUCT PERFORMANCE */}
                {detailTab === "products" && (
                  <motion.div key="products-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-neutral-800 flex items-center gap-1.5">Best Selling Items</h3>
                      <div className="overflow-x-auto mt-3 border border-neutral-100 rounded-2xl">
                        <table className="w-full text-left text-xs font-bold text-neutral-500">
                          <thead className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                            <tr>
                              <th className="p-3">Item Name</th>
                              <th className="p-3 text-center">Quantity Sold</th>
                              <th className="p-3 text-right">Revenue Generated</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {reportData.products.bestSelling.map((p, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50/50">
                                <td className="p-3 font-black text-neutral-850">{p._id}</td>
                                <td className="p-3 text-center font-bold text-neutral-600">{p.quantitySold}</td>
                                <td className="p-3 text-right font-black text-red-600">₹{p.revenueGenerated.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-neutral-800">Worst Selling Items</h3>
                      <div className="overflow-x-auto mt-3 border border-neutral-100 rounded-2xl">
                        <table className="w-full text-left text-xs font-bold text-neutral-500">
                          <thead className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                            <tr>
                              <th className="p-3">Item Name</th>
                              <th className="p-3 text-center">Quantity Sold</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {reportData.products.worstSelling.map((p, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50/50">
                                <td className="p-3 font-black text-neutral-850">{p._id}</td>
                                <td className="p-3 text-center font-bold text-neutral-600">{p.quantitySold}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-neutral-800">Category Turnovers</h3>
                      <div className="overflow-x-auto mt-3 border border-neutral-100 rounded-2xl">
                        <table className="w-full text-left text-xs font-bold text-neutral-500">
                          <thead className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                            <tr>
                              <th className="p-3">Category Name</th>
                              <th className="p-3 text-center">Orders Count</th>
                              <th className="p-3 text-right">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {reportData.products.categoryPerformance.map((c, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50/50">
                                <td className="p-3 font-black text-neutral-850">{c._id}</td>
                                <td className="p-3 text-center font-semibold text-neutral-600">{c.ordersCount}</td>
                                <td className="p-3 text-right font-black text-red-600">₹{c.revenue.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. PAYMENT REPORTS */}
                {detailTab === "payments" && (
                  <motion.div key="payments-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <h3 className="text-sm font-black text-neutral-800">Transaction Status and Clearance</h3>
                    <div className="grid gap-3 sm:grid-cols-2 mt-3">
                      <div className="p-4 border border-green-100 bg-green-50/20 rounded-2xl flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-wider text-green-700">Paid Collections</span>
                          <p className="mt-1 text-xs font-bold text-neutral-400">{reportData.payments.paidCount} Transactions</p>
                        </div>
                        <p className="text-xl font-black text-green-600">₹{reportData.payments.totalCollection.toFixed(2)}</p>
                      </div>
                      
                      <div className="p-4 border border-amber-100 bg-amber-50/20 rounded-2xl flex justify-between items-center">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-wider text-amber-700">Pending Billing</span>
                          <p className="mt-1 text-xs font-bold text-neutral-400">{reportData.payments.unpaidCount} Bills</p>
                        </div>
                        <p className="text-xl font-black text-amber-600">Active Queue</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-black text-neutral-800">Payment Gateways / Methods Used</h3>
                      <div className="overflow-x-auto mt-3 border border-neutral-100 rounded-2xl">
                        <table className="w-full text-left text-xs font-bold text-neutral-500">
                          <thead className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                            <tr>
                              <th className="p-3">Payment Method</th>
                              <th className="p-3 text-center">Transaction Count</th>
                              <th className="p-3 text-right">Total Collection</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {reportData.payments.methods.map((m, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50/50">
                                <td className="p-3 font-black text-neutral-850 uppercase tracking-wider">{m._id || "Other"}</td>
                                <td className="p-3 text-center font-bold text-neutral-600">{m.count}</td>
                                <td className="p-3 text-right font-black text-red-600">₹{m.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. TABLE REPORTS */}
                {detailTab === "tables" && (
                  <motion.div key="tables-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <h3 className="text-sm font-black text-neutral-800">Active Tables and Revenue</h3>
                    <div className="overflow-x-auto mt-3 border border-neutral-100 rounded-2xl">
                      <table className="w-full text-left text-xs font-bold text-neutral-500">
                        <thead className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100">
                          <tr>
                            <th className="p-3">Table Number</th>
                            <th className="p-3 text-center">Total Orders Served</th>
                            <th className="p-3 text-right">Revenue Generated</th>
                            <th className="p-3 text-right">Average Bill Size</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {reportData.tables.map((table, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50/50">
                              <td className="p-3 font-black text-neutral-850">Table {table.tableNumber}</td>
                              <td className="p-3 text-center font-semibold text-neutral-600">{table.totalOrders}</td>
                              <td className="p-3 text-right font-black text-red-600">₹{table.revenueGenerated.toFixed(2)}</td>
                              <td className="p-3 text-right font-bold text-neutral-500">₹{table.averageBillValue.toFixed(2)}</td>
                            </tr>
                          ))}
                          {reportData.tables.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center py-6 text-neutral-400">No active tables found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Highlight Widgets */}
          <div className="space-y-6">
            {/* Highlights Card */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="font-black text-neutral-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <FaAward className="text-red-500" /> Table Performance Highlights
              </h3>
              
              <div className="space-y-4">
                <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
                  <span className="text-[9px] uppercase font-black tracking-wider text-neutral-400 block">Most Active Table</span>
                  <span className="mt-1 text-sm font-black text-neutral-800 block">{highlights.activeTable}</span>
                </div>
                <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50">
                  <span className="text-[9px] uppercase font-black tracking-wider text-neutral-400 block">Highest Revenue Table</span>
                  <span className="mt-1 text-sm font-black text-neutral-800 block">{highlights.highestRevenueTable}</span>
                </div>
              </div>
            </div>

            {/* Category Performance Highlights */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-black text-neutral-800 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <FaTags className="text-red-500" /> Category Performance
              </h3>
              
              <div className="space-y-3.5">
                {reportData.products.categoryPerformance.slice(0, 5).map((cat, idx) => {
                  const maxVal = Math.max(...reportData.products.categoryPerformance.map(c => c.revenue || 1), 1);
                  const percent = (cat.revenue / maxVal) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-black text-neutral-700">
                        <span>{cat._id}</span>
                        <span className="text-neutral-500">₹{cat.revenue.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-neutral-150 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {reportData.products.categoryPerformance.length === 0 && (
                  <div className="text-center text-neutral-400 py-6 font-bold text-xs">No category data.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
