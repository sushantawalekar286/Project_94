import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import { createCategory, createMenuItem, deleteMenuItem, getCategories, getMenu, updateMenuItem, updateMenuItemAvailability } from "../../services/menuService";
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
  const [editingId, setEditingId] = useState(null);
  const [filterMode, setFilterMode] = useState("all"); // "all", "available", "unavailable"

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

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      imageUrl: item.imageUrl || item.image || "",
      category: item.category?._id || item.category || "",
      pricingType: item.pricingType || "single",
      singlePrice: item.singlePrice ?? item.price ?? "",
      halfPrice: item.halfPrice ?? "",
      fullPrice: item.fullPrice ?? ""
    });
  };

  const toggleAvailability = async (item) => {
    const isAvail = !(item.available ?? item.isAvailable ?? true);
    try {
      await updateMenuItemAvailability(item._id, isAvail);
      toast.success(`${item.name} is now ${isAvail ? "available" : "unavailable"}`);
      refresh();
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.category) return toast.error("Please select a category");
    if (form.pricingType === "single" && !form.singlePrice) return toast.error("Please enter a single price");
    if (form.pricingType === "half-full" && (!form.halfPrice || !form.fullPrice)) return toast.error("Please enter half and full prices");

    try {
      const payload = {
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
      };

      if (editingId) {
        // preserve the existing availability state of the item when updating other details
        const existingItem = items.find(item => item._id === editingId);
        if (existingItem) {
          payload.available = existingItem.available ?? existingItem.isAvailable ?? true;
          payload.isAvailable = payload.available;
        }
        await updateMenuItem(editingId, payload);
        toast.success("Menu item updated");
        setEditingId(null);
      } else {
        await createMenuItem(payload);
        toast.success("Menu item added");
      }
      setForm({ ...emptyForm, category: categories[0]?._id || "" });
      refresh();
    } catch {
      toast.error(editingId ? "Failed to update menu item" : "Failed to add menu item");
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

  const filteredItems = items.filter((item) => {
    const isAvail = item.available ?? item.isAvailable ?? true;
    if (filterMode === "available") return isAvail === true;
    if (filterMode === "unavailable") return isAvail === false;
    return true;
  });

  return (
    <section className="px-4 py-6 sm:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Admin full control</p>
      <h1 className="mt-2 text-4xl font-black">Menu Management</h1>
      <div className="mt-7 grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="mb-4 text-xl font-black">{editingId ? "Edit Menu Item" : "Add Menu Item"}</h2>
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
          <Button type="submit" className="w-full">
            {editingId ? "Update Menu Item" : "Save Menu Item"}
          </Button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ ...emptyForm, category: categories[0]?._id || "" });
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 py-3 font-bold hover:text-red-400 bg-white/5 text-white/60"
            >
              Cancel Edit
            </button>
          )}

          <div className="mt-5 flex gap-2 pt-4 border-t border-white/10">
            <input className="input-field" placeholder="Create new category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} />
            <button type="button" onClick={addCategory} className="rounded-xl bg-gold-500 px-4 font-bold text-black">Add</button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-xl font-black">Food Items</h2>
            <div className="flex gap-2 rounded-xl bg-black/45 p-1">
              {["all", "available", "unavailable"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                    filterMode === mode ? "bg-gold-500 text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {filteredItems?.map((item) => (
              <div key={item._id} className="grid gap-3 rounded-2xl bg-black/30 p-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                <img className="h-18 h-[72px] w-[72px] rounded-xl object-cover" src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"} alt={item.name} />
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-white/50">
                    {item.category?.name} · {item.pricingType === "half-full" ? `Half ₹${item.halfPrice || 0} / Full ₹${item.fullPrice || 0}` : `₹${item.singlePrice ?? item.price ?? 0}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                      (item.available ?? item.isAvailable)
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/35"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/35"
                    }`}
                  >
                    {(item.available ?? item.isAvailable) ? "Available" : "Unavailable"}
                  </button>
                  <button onClick={() => startEdit(item)} className="rounded-xl bg-white/10 p-3 text-gold-400 hover:text-gold-300">
                    <FaPen />
                  </button>
                  <button onClick={() => deleteMenuItem(item._id).then(refresh)} className="rounded-xl bg-red-500/10 p-3 text-red-300 hover:text-red-200">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
            {(!filteredItems || filteredItems.length === 0) && <p className="text-white/55">No menu items match selected filter.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
