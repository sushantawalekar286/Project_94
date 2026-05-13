import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaShoppingBag, FaSearch } from "react-icons/fa";
import { getMenu } from "../../services/menuService";
import { useCart } from "../../hooks/useCart";
import CategoryList from "../../components/menu/CategoryList";
import MenuCard from "../../components/menu/MenuCard";
import Loader from "../../components/common/Loader";

const fallbackCategories = ["Pizza", "Burgers", "Fries", "Beverages"];
const fallbackImages = {
  Pizza: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  Fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
  Beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80"
};

const fallbackMenu = fallbackCategories.flatMap((category, categoryIndex) =>
  [1, 2, 3].map((count) => ({
    _id: `${category}-${count}`,
    name: `${category === "Fries" ? "Loaded" : "Signature"} ${category} ${count}`,
    description: "Chef curated flavors with premium ingredients and a polished restaurant finish.",
    price: 129 + categoryIndex * 70 + count * 35,
    rating: 4.6 + count / 10,
    imageUrl: fallbackImages[category],
    category: { name: category }
  }))
);

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Pizza");
  const [search, setSearch] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, items: cartItems, tableSession, setTableSession } = useCart();

  useEffect(() => {
    const tableNumber = Number(params.get("table") || tableSession.tableNumber || 1);
    const token = params.get("token") || tableSession.token || "";
    setTableSession({ tableNumber, token });
  }, [params]);

  useEffect(() => {
    getMenu()
      .then((res) => setItems(res.data?.length ? res.data : fallbackMenu))
      .catch(() => setItems(fallbackMenu))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const names = [...new Set(items.map((item) => item.category?.name).filter(Boolean))];
    return (names.length ? names : fallbackCategories).map((name) => ({ name }));
  }, [items]);

  const filtered = items.filter((item) => {
    const matchesCategory = item.category?.name === category;
    const matchesSearch = `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="min-h-screen bg-black px-4 pb-28 pt-5 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="sticky top-0 z-20 -mx-4 border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold-400">Aurum Bistro</p>
              <h1 className="text-2xl font-black sm:text-4xl">Digital Menu</h1>
            </div>
            <button
              onClick={() => navigate("/customer/cart")}
              className="relative grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-gold-500 text-white shadow-glow"
            >
              <FaShoppingBag />
              {cartItems.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-black">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <FaSearch className="text-gold-400" />
              <input
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pizza, burgers, fries, beverages"
              />
            </label>
            <div className="rounded-2xl border border-gold-400/20 bg-gold-400/10 px-4 py-3 text-sm font-bold text-gold-400">
              Table {tableSession.tableNumber}
            </div>
          </div>
        </header>

        <CategoryList categories={categories} active={category} onSelect={setCategory} />

        {loading ? (
          <Loader label="Preparing the menu" />
        ) : (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, index) => (
              <MenuCard
                key={item._id}
                item={item}
                index={index}
                onAdd={(selected, quantity) => {
                  addItem({ menuItem: selected._id, name: selected.name, price: selected.price, quantity, imageUrl: selected.imageUrl });
                  toast.success(`${selected.name} added to cart`);
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
