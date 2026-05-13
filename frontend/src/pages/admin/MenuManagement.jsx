import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPen, FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { createCategory, createMenuItem, deleteMenuItem, getCategories, getMenu } from "../../services/menuService";
import { getInventory } from "../../services/inventoryService";
import Button from "../../components/common/Button";

const emptyForm = { name: "", description: "", price: "", imageUrl: "", category: "", ingredients: [] };

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [ingredientQty, setIngredientQty] = useState("");

  const refresh = () => {
    getMenu().then((res) => {
      const arrayData = res.data?.data || res.data || [];
      setItems(Array.isArray(arrayData) ? arrayData : []);
    }).catch(() => setItems([]));
    
    getCategories().then((res) => {
      const cats = res.data?.data || res.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
      setForm((current) => ({ ...current, category: current.category || cats[0]?._id || "" }));
    }).catch(() => setCategories([]));

    getInventory().then((res) => {
      const inv = res.data?.data || res.data || [];
      setInventory(Array.isArray(inv) ? inv : []);
      if (inv.length > 0) setSelectedIngredient(inv[0]._id);
    }).catch(() => setInventory([]));
  };

  useEffect(() => { refresh(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.category) return toast.error("Please select a category");
    
    try {
      await createMenuItem({ ...form, price: Number(form.price), isAvailable: true });
      toast.success("Menu item added");
      setForm({ ...emptyForm, category: categories[0]?._id || "" });
      refresh();
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const addIngredient = () => {
    if (!selectedIngredient || !ingredientQty || Number(ingredientQty) <= 0) return toast.error("Select ingredient and valid quantity");
    
    const invItem = inventory.find(i => i._id === selectedIngredient);
    if (!invItem) return;

    if (form.ingredients.find(i => i.inventoryItem === selectedIngredient)) {
      return toast.error("Ingredient already added");
    }

    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { inventoryItem: selectedIngredient, quantity: Number(ingredientQty), name: invItem.name, unit: invItem.unit }]
    }));
    setIngredientQty("");
  };

  const removeIngredient = (id) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.inventoryItem !== id)
    }));
  };

  return (
    <section className="px-4 py-6 sm:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Admin full control</p>
      <h1 className="mt-2 text-4xl font-black">Menu Management</h1>
      <div className="mt-7 grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="mb-4 text-xl font-black">Add Menu Item</h2>
          {["name", "description", "price", "imageUrl"].map((field) => (
            <input
              key={field}
              className="input-field mb-3"
              placeholder={field === "imageUrl" ? "Image URL" : field[0].toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              required={field === "name" || field === "price"}
              type={field === "price" ? "number" : "text"}
            />
          ))}
          <select className="input-field mb-3" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
            <option value="" disabled>Select Category</option>
            {categories?.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>

          {/* Ingredient Selection */}
          <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3">
            <h3 className="mb-2 font-bold text-white/80">Recipe Ingredients</h3>
            <div className="flex gap-2 mb-2">
              <select className="input-field flex-1 text-sm" value={selectedIngredient} onChange={(e) => setSelectedIngredient(e.target.value)}>
                {inventory?.map(inv => <option key={inv._id} value={inv._id}>{inv.name} ({inv.unit})</option>)}
              </select>
              <input type="number" placeholder="Qty" className="input-field w-20 text-sm" value={ingredientQty} onChange={(e) => setIngredientQty(e.target.value)} />
              <button type="button" onClick={addIngredient} className="rounded-xl bg-gold-500 px-3 font-bold text-black"><FaPlus /></button>
            </div>
            
            <div className="space-y-2">
              {form.ingredients.map((ing) => (
                <div key={ing.inventoryItem} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-sm">
                  <span>{ing.name} <span className="text-gold-400">({ing.quantity} {ing.unit})</span></span>
                  <button type="button" onClick={() => removeIngredient(ing.inventoryItem)} className="text-red-400 hover:text-red-300"><FaTimes /></button>
                </div>
              ))}
              {form.ingredients.length === 0 && <p className="text-xs text-white/40">No ingredients added.</p>}
            </div>
          </div>

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
                  <p className="text-sm text-white/50">{item.category?.name} · ₹{item.price}</p>
                  {item.ingredients?.length > 0 && (
                    <p className="mt-1 text-xs text-gold-400">
                      Recipe: {item.ingredients.map(i => `${i.inventoryItem?.name || 'Unknown'} (${i.quantity})`).join(", ")}
                    </p>
                  )}
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
