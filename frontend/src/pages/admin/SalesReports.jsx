import { useEffect, useState } from "react";
import { FaArrowTrendUp, FaCalendarDays, FaCoins, FaReceipt, FaRankingStar, FaChartLine, FaChartSimple } from "react-icons/fa6";
import { getRevenueTimeline, getTopItems, getDashboardStats } from "../../services/salesService";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SalesReports() {
  const [days, setDays] = useState(7);
  const [timeline, setTimeline] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [stats, setStats] = useState({ monthlyRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async (selectedDays) => {
    setLoading(true);
    try {
      const [timelineRes, topItemsRes, statsRes] = await Promise.all([
        getRevenueTimeline(selectedDays),
        getTopItems(5),
        getDashboardStats()
      ]);

      const timelineData = timelineRes.data?.data || timelineRes.data || [];
      const topItemsData = topItemsRes.data?.data || topItemsRes.data || [];
      const statsData = statsRes.data?.data || statsRes.data || {};

      setTimeline(Array.isArray(timelineData) ? timelineData : []);
      setTopItems(Array.isArray(topItemsData) ? topItemsData : []);
      setStats(statsData);
      setError(false);
    } catch (err) {
      console.error("[SalesReports] Fetch failed:", err);
      setError(true);
      toast.error("Failed to load sales report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(days);
  }, [days]);

  if (loading && timeline.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-neutral-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        <span className="ml-3 font-bold text-xs">Loading analytics reports...</span>
      </div>
    );
  }

  if (error && timeline.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-red-600 font-bold">
        Failed to load sales analytics.
      </div>
    );
  }

  // Calculate summary metrics for the selected timeline period
  const totalRevenue = timeline.reduce((sum, day) => sum + (day.total || 0), 0);
  const totalOrdersCount = timeline.reduce((sum, day) => sum + (day.count || 0), 0);
  const averageDailyRevenue = timeline.length ? totalRevenue / timeline.length : 0;
  const peakDayRevenue = timeline.reduce((max, day) => Math.max(max, day.total || 0), 0);

  const maxTimelineRevenue = Math.max(...timeline.map(t => t.total || 1), 1);

  const summaryCards = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${days} Days Total`,
      icon: FaCoins,
      colorClass: "border-emerald-100 bg-emerald-50/50 text-emerald-700"
    },
    {
      label: "Average Daily",
      value: `₹${averageDailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Daily Mean",
      icon: FaChartLine,
      colorClass: "border-blue-100 bg-blue-50/50 text-blue-700"
    },
    {
      label: "Peak Day Sales",
      value: `₹${peakDayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Max In One Day",
      icon: FaArrowTrendUp,
      colorClass: "border-purple-100 bg-purple-50/50 text-purple-700"
    },
    {
      label: "Total Orders",
      value: `${totalOrdersCount} Orders`,
      subtitle: "Volume Sold",
      icon: FaReceipt,
      colorClass: "border-amber-100 bg-amber-50/50 text-amber-700"
    }
  ];

  return (
    <section className="min-h-screen bg-[#FAF9F6] px-4 py-8 text-neutral-800 sm:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header & Date Filters */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/60 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">
            Bistro Financial Report
          </p>
          <h1 className="mt-1 text-3xl font-black text-neutral-800 leading-tight tracking-tight">
            Revenue Analytics
          </h1>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-2 bg-white border border-neutral-200 p-1.5 rounded-2xl shadow-sm self-start">
          <FaCalendarDays className="text-neutral-400 ml-2.5 mr-1" size={14} />
          {[7, 15, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                days === d 
                  ? "bg-red-600 text-white shadow-sm" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </header>

      {/* Summary metrics cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.article 
              key={card.label} 
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden rounded-3xl border bg-white ${card.colorClass} p-6 shadow-sm flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-85 text-neutral-500">{card.label}</span>
                <Icon className="text-lg opacity-80" />
              </div>
              <div className="mt-4">
                <p className="truncate text-xl font-black text-neutral-800 tracking-tight leading-none">{card.value}</p>
                <p className="text-[9px] font-bold text-neutral-400 mt-2 uppercase tracking-wider">{card.subtitle}</p>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Analytics Chart & Legends Block */}
      <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-black text-neutral-800 tracking-tight flex items-center gap-1.5">
              <FaChartSimple className="text-red-600" size={14} /> Revenue Timeline Graph
            </h2>
            <p className="text-[10px] text-neutral-400 font-bold mt-1">Timeline of sales over the selected period</p>
          </div>

          {/* Chart Legends */}
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-6 rounded bg-gradient-to-t from-red-600 to-red-400 inline-block" />
              <span>Revenue (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Active Order Count</span>
            </div>
          </div>
        </div>

        {/* Bar Graph */}
        <div className="mt-8 flex h-72 items-end gap-1.5 sm:gap-3 md:gap-4 px-2 overflow-x-auto scrollbar-thin pb-2">
          {timeline.map((day, index) => {
            const height = (day.total / maxTimelineRevenue) * 100;
            return (
              <div key={index} className="flex min-w-[36px] flex-1 flex-col items-center gap-2 group relative">
                
                {/* Order count dot indicator */}
                {day.count > 0 && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm animate-pulse mb-1" />
                )}
 
                {/* Graph Bar */}
                <div 
                  className="w-full rounded-t-lg bg-gradient-to-t from-red-600 to-red-400 transition-all duration-300 hover:brightness-105 cursor-pointer shadow-sm" 
                  style={{ height: `${Math.max(height, 5)}%` }} 
                />
                
                {/* Date Label */}
                <span className="text-[9px] text-neutral-400 font-black tracking-tight">{day._id.slice(-5)}</span>
                
                {/* Tooltip on Hover */}
                <div className="absolute -top-14 scale-0 group-hover:scale-100 transition-transform duration-150 bg-neutral-900 border border-neutral-800 p-2.5 rounded-xl text-[9px] text-center z-20 w-max text-white shadow-md">
                  <p className="font-black text-red-400">₹{day.total.toFixed(2)}</p>
                  <p className="text-[8px] text-white/50 font-bold uppercase mt-0.5">{day.count} Orders</p>
                  <p className="text-[8px] text-neutral-400 mt-0.5">{day._id}</p>
                </div>
              </div>
            );
          })}
          {timeline.length === 0 && (
            <div className="w-full text-center text-neutral-400 py-16 font-bold flex flex-col items-center justify-center gap-2">
              <span>No sales data found for the selected period.</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Items Section */}
      <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm">
        <h2 className="text-base font-black text-neutral-800 tracking-tight mb-5 flex items-center gap-2">
          <FaRankingStar className="text-red-600" size={16} /> Top Performing Menu Items
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold text-neutral-600">
            <thead className="text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
              <tr>
                <th className="pb-3 font-black">Item Name</th>
                <th className="pb-3 font-black text-center">Quantity Sold</th>
                <th className="pb-3 font-black text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {topItems.map((item) => (
                <tr key={item._id} className="hover:bg-neutral-50/50 transition-colors text-neutral-600 font-semibold">
                  <td className="py-4 font-black text-neutral-800">{item._id}</td>
                  <td className="py-4 text-center font-mono font-bold text-neutral-500">{item.totalQty}</td>
                  <td className="py-4 text-right font-mono font-black text-red-600">₹{item.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
              {topItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-neutral-400 font-bold">
                    No menu sales data recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}
