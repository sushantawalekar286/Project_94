import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import { createCategory, createMenuItem, deleteMenuItem, getCategories, getMenu } from "../../services/menuService";
import Button from "../../components/common/Button";

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  category: "",
  pricingType: "single",
  singlePrice: "",
  halfPrice: "",
  fullPrice: ""
};

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState("");

  const refresh = () => {
    getMenu()
      .then((res) => {
        const arrayData = res.data?.data || res.data || [];
        setItems(Array.isArray(arrayData) ? arrayData : []);
      })
      .catch(() => setItems([]));

    getCategories()
      .then((res) => {
        const cats = res.data?.data || res.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
        setForm((current) => ({ ...current, category: current.category || cats[0]?._id || "" }));
      })
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.category) return toast.error("Please select a category");
    if (form.pricingType === "single" && !form.singlePrice) return toast.error("Please enter a single price");
    if (form.pricingType === "half-full" && (!form.halfPrice || !form.fullPrice)) return toast.error("Please enter half and full prices");

    try {
      await createMenuItem({
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        category: form.category,
        pricingType: form.pricingType,
        singlePrice: form.pricingType === "single" ? Number(form.singlePrice) : Number(form.singlePrice || form.fullPrice),
        halfPrice: form.pricingType === "half-full" ? Number(form.halfPrice) : null,
        fullPrice: form.pricingType === "half-full" ? Number(form.fullPrice) : Number(form.singlePrice),
        price: form.pricingType === "single" ? Number(form.singlePrice) : Number(form.fullPrice),
        available: true
      });
      toast.success("Menu item added");
      setForm({ ...emptyForm, category: categories[0]?._id || "" });
      refresh();
    } catch {
      toast.error("Failed to add menu item");
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await createCategory({ name: newCategory });
      toast.success("Category created");
      setNewCategory("");
      refresh();
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <section className="px-4 py-6 sm:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Admin full control</p>
      <h1 className="mt-2 text-4xl font-black">Menu Management</h1>
      <div className="mt-7 grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="mb-4 text-xl font-black">Add Menu Item</h2>
          <input
            className="input-field mb-3"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <textarea
            className="input-field mb-3 min-h-28"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <input
            className="input-field mb-3"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
            type="text"
          />
          <select className="input-field mb-3" value={form.pricingType} onChange={(event) => setForm({ ...form, pricingType: event.target.value })}>
            <option value="single">Single</option>
            <option value="half-full">Half / Full</option>
          </select>
          {form.pricingType === "single" ? (
            <input
              className="input-field mb-3"
              type="number"
              min="0"
              placeholder="Single Price"
              value={form.singlePrice}
              onChange={(event) => setForm({ ...form, singlePrice: event.target.value })}
              required
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input-field mb-3"
                type="number"
                min="0"
                placeholder="Half Price"
                value={form.halfPrice}
                onChange={(event) => setForm({ ...form, halfPrice: event.target.value })}
                required
              />
              <input
                className="input-field mb-3"
                type="number"
                min="0"
                placeholder="Full Price"
                value={form.fullPrice}
                onChange={(event) => setForm({ ...form, fullPrice: event.target.value })}
                required
              />
            </div>
          )}
          <select className="input-field mb-3" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
            <option value="" disabled>Select Category</option>
            {categories?.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          <p className="mb-4 text-xs text-white/45">
            {form.pricingType === "half-full"
              ? `Half: ₹${form.halfPrice || 0} · Full: ₹${form.fullPrice || 0}`
              : `Single: ₹${form.singlePrice || 0}`}
          </p>
          <Button type="submit" className="w-full"><FaPlus /> Save Menu Item</Button>

          <div className="mt-5 flex gap-2 pt-4 border-t border-white/10">
            <input className="input-field" placeholder="Create new category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} />
            <button type="button" onClick={addCategory} className="rounded-xl bg-gold-500 px-4 font-bold text-black">Add</button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="mb-4 text-xl font-black">Food Items</h2>
          <div className="grid gap-3">
            {items?.map((item) => (
              <div key={item._id} className="grid gap-3 rounded-2xl bg-black/30 p-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                <img className="h-18 h-[72px] w-[72px] rounded-xl object-cover" src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"} alt={item.name} />
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-white/50">
                    {item.category?.name} · {item.pricingType === "half-full" ? `Half ₹${item.halfPrice || 0} / Full ₹${item.fullPrice || 0}` : `₹${item.singlePrice ?? item.price ?? 0}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl bg-white/10 p-3 text-gold-400"><FaPen /></button>
                  <button onClick={() => deleteMenuItem(item._id).then(refresh)} className="rounded-xl bg-red-500/10 p-3 text-red-300"><FaTrash /></button>
                </div>
              </div>
            ))}
            {(!items || items.length === 0) && <p className="text-white/55">No menu items yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
