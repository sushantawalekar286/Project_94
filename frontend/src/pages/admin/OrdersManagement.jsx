import { useEffect, useState } from "react";
import { getOrders } from "../../services/orderService";
import StatusBadge from "../../components/chef/StatusBadge";

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getOrders().then((res) => setOrders(res.data)).catch(() => setOrders([]));
  }, []);

  const filtered = orders.filter((order) => String(order.tableNumber).includes(search) || order.status.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="px-4 py-6 sm:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Order audit trail</p>
      <h1 className="mt-2 text-4xl font-black">Orders Management</h1>
      <input className="input-field mt-6 max-w-md" placeholder="Search table or status" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="mt-6 grid gap-4">
        {filtered.map((order) => (
          <article key={order._id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Table {order.tableNumber}</h2>
                <p className="text-sm text-white/50">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {order.items?.map((item) => <div key={item.name} className="rounded-2xl bg-black/30 p-3">{item.name} x{item.quantity}</div>)}
            </div>
            <p className="mt-4 text-right text-xl font-black text-gold-400">₹{order.total}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
