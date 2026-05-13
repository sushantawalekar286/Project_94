import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getInventory, updateInventory } from "../../services/inventoryService";

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = () => {
    setLoading(true);
    getInventory()
      .then((res) => {
        const arrayData = res.data?.data || res.data || [];
        setItems(Array.isArray(arrayData) ? arrayData : []);
        setError(false);
      })
      .catch(() => {
        setItems([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { refresh(); }, []);

  const updateStock = async (item, stock) => {
    try {
      await updateInventory(item._id, { stock: Number(stock) });
      toast.success("Inventory updated");
      refresh();
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-white/55">Loading inventory...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-400">Failed to load inventory.</div>;

  return (
    <section className="px-4 py-6 sm:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Ingredient stock and low alerts</p>
      <h1 className="mt-2 text-4xl font-black">Inventory Management</h1>
      <div className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
        <div className="hidden grid-cols-6 gap-4 border-b border-white/10 p-4 text-sm font-bold text-white/55 md:grid">
          <span>Raw Material</span><span>Unit</span><span>Quantity Remaining</span><span>Used Stock</span><span>Status</span><span>Update</span>
        </div>
        {items?.map((item) => {
          const low = item.stock <= item.lowStockThreshold;
          return (
            <div key={item._id} className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-6 md:items-center">
              <span className="font-bold">{item.name}</span>
              <span className="text-white/60">{item.unit}</span>
              <span className="font-medium text-lg">{item.stock}</span>
              <span className="text-white/50">{item.totalUsed || 0}</span>
              <span className={`w-max rounded-full px-3 py-1 text-xs font-bold ${low ? "bg-red-500/15 text-red-300" : "bg-green-500/15 text-green-300"}`}>
                {low ? "Low stock" : "In stock"}
              </span>
              <input className="input-field" type="number" defaultValue={item.stock} onBlur={(event) => updateStock(item, event.target.value)} />
            </div>
          );
        })}
        {(!items || items.length === 0) && <p className="p-5 text-white/55">No inventory items found.</p>}
      </div>
    </section>
  );
}
