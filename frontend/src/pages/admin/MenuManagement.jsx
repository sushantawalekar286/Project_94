import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { 
  FaPen, 
  FaPlus, 
  FaTrash, 
  FaSearch, 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaChevronDown, 
  FaChevronUp, 
  FaFolder, 
  FaUtensils, 
  FaCheckCircle, 
  FaTimesCircle,
  FaTable,
  FaFolderOpen
} from "react-icons/fa";
import { 
  createCategory, 
  createMenuItem, 
  deleteMenuItem, 
  getCategories, 
  getMenu, 
  updateMenuItem, 
  updateMenuItemAvailability,
  updateCategory,
  deleteCategory
} from "../../services/menuService";
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
  
  // Category CRUD states
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    image: "",
    menuType: "cafe",
    isActive: true
  });
  const [editingCatId, setEditingCatId] = useState(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // Filters & Search
  const [filterMode, setFilterMode] = useState("all"); // "all", "available", "unavailable"
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");



  // Views & Table states
  const [viewMode, setViewMode] = useState("table"); // "table", "category", or "category-list"
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

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

  // Reset pagination on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryFilter, filterMode]);

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

  const handleCatFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return toast.error("Category name is required");

    try {
      if (editingCatId) {
        await updateCategory(editingCatId, catForm);
        toast.success("Category updated successfully");
        setEditingCatId(null);
      } else {
        await createCategory(catForm);
        toast.success("Category created successfully");
      }
      setCatForm({ name: "", description: "", image: "", menuType: "cafe", isActive: true });
      refresh();
    } catch {
      toast.error("Failed to save category");
    }
  };

  const startEditCategory = (cat) => {
    setEditingCatId(cat._id);
    setCatForm({
      name: cat.name || "",
      description: cat.description || "",
      image: cat.image || "",
      menuType: cat.menuType || "cafe",
      isActive: cat.isActive !== false
    });
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category? All items in it will remain uncategorized.")) {
      try {
        await deleteCategory(id);
        toast.success("Category deleted");
        refresh();
      } catch {
        toast.error("Failed to delete category");
      }
    }
  };

  const toggleCategoryStatus = async (cat) => {
    try {
      const nextActive = !cat.isActive;
      await updateCategory(cat._id, { isActive: nextActive });
      toast.success(`Category ${cat.name} is now ${nextActive ? "Active" : "Inactive"}`);
      refresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteMenuItem(id);
        toast.success("Menu item deleted");
        refresh();
      } catch {
        toast.error("Failed to delete menu item");
      }
    }
  };

  // Sort & filter logic
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 1. Search Query (Name, Category, Product Code)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        const code = item.code || `T-${item._id?.substring(item._id.length - 6).toUpperCase()}`;
        return (
          item.name?.toLowerCase().includes(query) ||
          item.category?.name?.toLowerCase().includes(query) ||
          code.toLowerCase().includes(query)
        );
      });
    }

    // 2. Category Dropdown Filter
    if (selectedCategoryFilter !== "all") {
      result = result.filter(item => {
        const catId = item.category?._id || item.category;
        return catId === selectedCategoryFilter;
      });
    }

    // 3. Status Filter (All, Available, Unavailable)
    if (filterMode === "available") {
      result = result.filter(item => (item.available ?? item.isAvailable ?? true) === true);
    } else if (filterMode === "unavailable") {
      result = result.filter(item => (item.available ?? item.isAvailable ?? true) === false);
    }

    // 4. Sort Items
    result.sort((a, b) => {
      let valA = "";
      let valB = "";

      if (sortBy === "name") {
        valA = a.name?.toLowerCase() || "";
        valB = b.name?.toLowerCase() || "";
      } else if (sortBy === "category") {
        valA = a.category?.name?.toLowerCase() || "";
        valB = b.category?.name?.toLowerCase() || "";
      } else if (sortBy === "price") {
        valA = a.pricingType === "half-full" ? (a.fullPrice ?? a.price ?? 0) : (a.singlePrice ?? a.price ?? 0);
        valB = b.pricingType === "half-full" ? (b.fullPrice ?? b.price ?? 0) : (b.singlePrice ?? b.price ?? 0);
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, searchQuery, selectedCategoryFilter, filterMode, sortBy, sortOrder]);

  // Statistics Dashboard details
  const stats = useMemo(() => {
    const totalCats = categories.length;
    const totalProds = items.length;
    const active = items.filter(i => i.available ?? i.isAvailable ?? true).length;
    const inactive = totalProds - active;
    return { totalCats, totalProds, active, inactive };
  }, [items, categories]);

  // Category-wise grouped products
  const groupedItems = useMemo(() => {
    const groups = {};
    filteredAndSortedItems.forEach(item => {
      const catName = item.category?.name || "Uncategorized";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(item);
    });
    return groups;
  }, [filteredAndSortedItems]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name?.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );
  }, [categories, categorySearchQuery]);

  // Pagination details
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage) || 1;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(current => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const toggleCategoryCollapse = (catName) => {
    setCollapsedCategories(current => ({
      ...current,
      [catName]: !current[catName]
    }));
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="text-neutral-300" />;
    return sortOrder === "asc" ? <FaSortUp className="text-red-600" /> : <FaSortDown className="text-red-600" />;
  };

  return (
    <section className="px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6 text-neutral-800">
      
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">
          94 Cafe & Chinese Portal
        </p>
        <h1 className="mt-1 text-3xl font-black text-neutral-800 leading-tight tracking-tight">
          Menu Management
        </h1>
      </div>

      {/* Menu Statistics Dashboard */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          ["Total Categories", stats.totalCats, <FaFolderOpen size={15} />, "border-amber-100 bg-amber-50 text-amber-700"],
          ["Total Products", stats.totalProds, <FaUtensils size={15} />, "border-blue-100 bg-blue-50 text-blue-700"],
          ["Active Products", stats.active, <FaCheckCircle size={15} />, "border-green-100 bg-green-50 text-green-700"],
          ["Inactive Products", stats.inactive, <FaTimesCircle size={15} />, "border-red-100 bg-red-50 text-red-700"]
        ].map(([title, val, icon, colorClasses]) => (
          <div key={title} className={`rounded-3xl border p-5 shadow-sm flex items-center justify-between bg-white ${colorClasses}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-70">{title}</p>
              <p className="text-2xl font-black mt-1 leading-none text-neutral-800">{val}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-white border border-neutral-100 shadow-sm">
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* Control Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white border border-neutral-200/60 p-4 rounded-3xl justify-between items-stretch md:items-center shadow-sm">
        
        {/* Search */}
        <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 flex-1 max-w-md">
          <FaSearch className="text-red-600" />
          <input
            id="productSearchInput"
            className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, category, product code..."
            aria-label="Search products"
          />
        </label>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          
          {/* Category Filter */}
          <select
            id="categoryFilterSelect"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-white border border-neutral-200 text-xs font-bold rounded-2xl px-4 py-2.5 text-neutral-700 focus:border-red-500 focus:outline-none cursor-pointer shadow-sm"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter buttons */}
          <div className="flex gap-1 bg-neutral-100 rounded-2xl border border-neutral-200/50 p-1">
            {["all", "available", "unavailable"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className={`rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-150 ${
                  filterMode === mode ? "bg-red-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        
        {/* Add/Edit Form */}
        <form onSubmit={submit} className="rounded-3xl border border-neutral-200/60 bg-white p-5 h-fit space-y-4 shadow-sm">
          <h2 className="text-base font-black text-neutral-800 border-b border-neutral-100 pb-3">
            {editingId ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          
          <div>
            <label htmlFor="formName" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Product Name</label>
            <input
              id="formName"
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-medium"
              placeholder="e.g. Margherita Pizza"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="formDesc" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Description</label>
            <textarea
              id="formDesc"
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 min-h-20 resize-none font-medium"
              placeholder="Describe the dish ingredients..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="formImage" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Image URL</label>
            <input
              id="formImage"
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-medium"
              placeholder="Paste unsplash food image link..."
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              type="text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="formCategory" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Category</label>
              <select 
                id="formCategory"
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 cursor-pointer font-bold"
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                required
              >
                <option value="" disabled>Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="formPricingType" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Price Structure</label>
              <select 
                id="formPricingType"
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 cursor-pointer font-bold"
                value={form.pricingType} 
                onChange={(e) => setForm({ ...form, pricingType: e.target.value })}
              >
                <option value="single">Single Price</option>
                <option value="half-full">Half / Full Portion</option>
              </select>
            </div>
          </div>

          <div>
            {form.pricingType === "single" ? (
              <div>
                <label htmlFor="formSinglePrice" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Price (₹)</label>
                <input
                  id="formSinglePrice"
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-bold"
                  type="number"
                  min="0"
                  placeholder="₹ Single Portion Price"
                  value={form.singlePrice}
                  onChange={(e) => setForm({ ...form, singlePrice: e.target.value })}
                  required
                />
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label htmlFor="formHalfPrice" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Half Price (₹)</label>
                  <input
                    id="formHalfPrice"
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-bold"
                    type="number"
                    min="0"
                    placeholder="₹ Half Price"
                    value={form.halfPrice}
                    onChange={(e) => setForm({ ...form, halfPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="formFullPrice" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">Full Price (₹)</label>
                  <input
                    id="formFullPrice"
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-bold"
                    type="number"
                    min="0"
                    placeholder="₹ Full Price"
                    value={form.fullPrice}
                    onChange={(e) => setForm({ ...form, fullPrice: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full uppercase tracking-wider text-xs font-black py-3.5 mt-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm">
            {editingId ? "Update Menu Item" : "Save Menu Item"}
          </Button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ ...emptyForm, category: categories[0]?._id || "" });
              }}
              className="w-full rounded-xl border border-neutral-200 py-3 font-bold hover:bg-neutral-50 text-neutral-500 text-xs transition duration-200"
            >
              Cancel Edit
            </button>
          )}

          {/* Quick Category Addition */}
          <div className="pt-4 border-t border-neutral-100 space-y-2">
            <label htmlFor="newCategoryInput" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400">Create New Category</label>
            <div className="flex gap-2">
              <input 
                id="newCategoryInput"
                className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:border-red-500 font-semibold" 
                placeholder="Category Name" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={addCategory} 
                className="rounded-xl bg-red-600 hover:bg-red-700 px-4 text-xs font-black text-white transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Listing & Presentation */}
        <div className="rounded-3xl border border-neutral-200/60 bg-white p-5 flex flex-col min-h-[500px] shadow-sm">
          
          {/* Header & Tabs */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center border-b border-neutral-100 pb-3">
            <h2 className="text-base font-black text-neutral-800 flex items-center gap-2">
              <FaUtensils className="text-red-600" /> Food Items Listing
            </h2>
            
            {/* View Mode Toggle */}
            <div className="flex bg-neutral-100 border border-neutral-200/50 rounded-2xl p-0.5 self-start">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase transition ${
                  viewMode === "table" ? "bg-red-600 text-white shadow-sm font-black" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <FaTable size={10} /> Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("category")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase transition ${
                  viewMode === "category" ? "bg-red-600 text-white shadow-sm font-black" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <FaFolder size={10} /> Category View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("category-list")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase transition ${
                  viewMode === "category-list" ? "bg-red-600 text-white shadow-sm font-black" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <FaFolderOpen size={10} /> Manage Categories
              </button>
            </div>
          </div>

          {/* VIEW: 1. Table View with Columns, Sort, and Pagination */}
          {viewMode === "table" && (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Responsive Container */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse" aria-label="Menu Items Table">
                  <thead>
                    <tr className="border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      <th className="py-3 px-2">Image</th>
                      <th className="py-3 px-2 cursor-pointer select-none hover:text-neutral-800" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-1.5">
                          Product Name {getSortIcon("name")}
                        </div>
                      </th>
                      <th className="py-3 px-2 cursor-pointer select-none hover:text-neutral-800" onClick={() => handleSort("category")}>
                        <div className="flex items-center gap-1.5">
                          Category {getSortIcon("category")}
                        </div>
                      </th>
                      <th className="py-3 px-2 cursor-pointer select-none hover:text-neutral-800" onClick={() => handleSort("price")}>
                        <div className="flex items-center gap-1.5">
                          Price {getSortIcon("price")}
                        </div>
                      </th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm text-neutral-600 font-semibold">
                    {paginatedItems.map((item) => (
                      <tr key={item._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 px-2">
                          <img
                            className="h-11 w-11 rounded-xl object-cover border border-neutral-100 shadow-sm"
                            src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80"}
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80";
                            }}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-black text-neutral-800 leading-tight">{item.name}</div>
                          <div className="text-[10px] font-mono text-neutral-400 mt-0.5 uppercase">
                            CODE: T-{item._id?.substring(item._id.length - 6).toUpperCase()}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-neutral-500">
                          {item.category?.name || "Uncategorized"}
                        </td>
                        <td className="py-3 px-2 font-black text-red-600">
                          {item.pricingType === "half-full" 
                            ? `H:₹${item.halfPrice || 0} / F:₹${item.fullPrice || 0}` 
                            : `₹${item.singlePrice ?? item.price ?? 0}`}
                        </td>
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            onClick={() => toggleAvailability(item)}
                            className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition ${
                              (item.available ?? item.isAvailable)
                                ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {(item.available ?? item.isAvailable) ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="inline-flex gap-1.5">
                            <button 
                              onClick={() => startEdit(item)} 
                              className="rounded-xl bg-white p-2 text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:bg-neutral-50 shadow-sm"
                              aria-label={`Edit ${item.name}`}
                            >
                              <FaPen size={9} />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item._id)} 
                              className="rounded-xl bg-red-50 p-2 text-red-600 hover:text-red-700 border border-red-100 hover:bg-red-100/50"
                              aria-label={`Delete ${item.name}`}
                            >
                              <FaTrash size={9} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!paginatedItems || paginatedItems.length === 0) && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-neutral-400">
                          No menu items match the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 mt-4 text-xs text-neutral-400">
                  <p>
                    Showing <span className="font-bold text-neutral-700">{Math.min(filteredAndSortedItems.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
                    <span className="font-bold text-neutral-700">{Math.min(filteredAndSortedItems.length, currentPage * itemsPerPage)}</span> of{" "}
                    <span className="font-bold text-neutral-700">{filteredAndSortedItems.length}</span> products
                  </p>
                  
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                      className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 hover:text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentPage(i + 1)}
                        className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black transition ${
                          currentPage === i + 1 ? "bg-red-600 text-white" : "border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                      className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 hover:text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW: 2. Grouped Category Accordion Panels */}
          {viewMode === "category" && (
            <div className="space-y-3">
              {Object.entries(groupedItems).map(([catName, prodList]) => {
                const isCollapsed = collapsedCategories[catName] === true;
                return (
                  <div key={catName} className="rounded-2xl border border-neutral-100 bg-neutral-50/20 overflow-hidden">
                    
                    {/* Collapsible header */}
                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(catName)}
                      className="w-full flex items-center justify-between p-4 bg-neutral-50/50 hover:bg-neutral-100/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <FaFolder className="text-red-600" />
                        <span className="font-black text-neutral-800 tracking-tight">{catName}</span>
                        <span className="rounded-full bg-white border border-neutral-200 px-2 py-0.5 text-[9px] font-bold text-neutral-500 shadow-sm">
                          {prodList.length} {prodList.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div>
                        {isCollapsed ? <FaChevronDown className="text-neutral-500" /> : <FaChevronUp className="text-neutral-500" />}
                      </div>
                    </button>

                    {/* Accordion panel products */}
                    {!isCollapsed && (
                      <div className="p-3 divide-y divide-neutral-100 bg-white">
                        {prodList.map((item) => (
                          <div key={item._id} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                className="h-10 w-10 rounded-xl object-cover flex-shrink-0 border border-neutral-100"
                                src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"}
                                alt={item.name}
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80";
                                }}
                              />
                              <div className="min-w-0">
                                <h4 className="font-black text-sm text-neutral-800 truncate leading-none">{item.name}</h4>
                                <p className="text-[10px] text-neutral-500 font-mono mt-1.5 uppercase">
                                  CODE: T-{item._id?.substring(item._id.length - 6).toUpperCase()} · {item.pricingType === "half-full" ? `H:₹${item.halfPrice} / F:₹${item.fullPrice}` : `₹${item.singlePrice ?? item.price}`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleAvailability(item)}
                                className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase transition ${
                                  (item.available ?? item.isAvailable)
                                    ? "bg-green-50 text-green-700 border border-green-150"
                                    : "bg-red-50 text-red-700 border border-red-150"
                                }`}
                              >
                                {(item.available ?? item.isAvailable) ? "Active" : "Inactive"}
                              </button>
                              <button 
                                onClick={() => startEdit(item)} 
                                className="rounded-xl bg-white p-2 text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:bg-neutral-50 shadow-sm"
                              >
                                <FaPen size={9} />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem(item._id)} 
                                className="rounded-xl bg-red-50 p-2 text-red-600 hover:text-red-700 border border-red-100"
                              >
                                <FaTrash size={9} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {prodList.length === 0 && <p className="p-3 text-xs text-neutral-500">No items grouped in this category.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
              {Object.keys(groupedItems).length === 0 && (
                <p className="text-neutral-400 text-center py-8">No products found to group.</p>
              )}
            </div>
          )}

          {/* VIEW: 3. Manage Categories Panel */}
          {viewMode === "category-list" && (
            <div className="flex-1 flex flex-col justify-between">
              {/* Category Search and Create Form */}
              <div className="mb-6 bg-neutral-50/50 p-4 border border-neutral-100 rounded-3xl space-y-4">
                <h3 className="text-sm font-black text-neutral-800">
                  {editingCatId ? "✏️ Edit Category" : "✨ Create New Category"}
                </h3>
                
                <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="catNameInput" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                        Category Name
                      </label>
                      <input
                        id="catNameInput"
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-red-500 font-semibold"
                        placeholder="e.g. Pizza, Beverages"
                        value={catForm.name}
                        onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="catMenuTypeInput" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                        Menu Type
                      </label>
                      <select
                        id="catMenuTypeInput"
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-700 focus:outline-none focus:border-red-500 font-bold cursor-pointer"
                        value={catForm.menuType || "cafe"}
                        onChange={(e) => setCatForm({ ...catForm, menuType: e.target.value })}
                        required
                      >
                        <option value="cafe">Cafe</option>
                        <option value="chinese">Chinese</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="catDescInput" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                        Description
                      </label>
                      <textarea
                        id="catDescInput"
                        className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-red-500 min-h-16 resize-none font-semibold"
                        placeholder="e.g. Traditional oven-baked sourdough pizzas"
                        value={catForm.description}
                        onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                        Category Image Upload / URL
                      </label>
                      <div className="flex flex-col gap-2">
                        {/* File upload input */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCatFileChange}
                          className="block w-full text-xs text-neutral-500 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-neutral-200 file:text-neutral-700 hover:file:bg-neutral-300 cursor-pointer"
                        />
                        <span className="text-[9px] text-neutral-400 font-bold text-center">- OR paste URL -</span>
                        <input
                          className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-red-500 font-semibold"
                          placeholder="Paste category image URL..."
                          value={catForm.image}
                          onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Image Preview */}
                    {catForm.image && (
                      <div className="flex items-center gap-3 bg-white border border-neutral-100 p-2 rounded-2xl w-fit">
                        <img
                          src={catForm.image}
                          alt="Category Preview"
                          className="h-10 w-10 rounded-xl object-cover border border-neutral-100 shadow-sm"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80";
                          }}
                        />
                        <span className="text-[10px] text-neutral-400 font-bold">Image Preview</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs font-black text-neutral-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={catForm.isActive}
                          onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
                          className="rounded text-red-600 focus:ring-red-500 border-neutral-300"
                        />
                        Active Status
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-neutral-100">
                    {editingCatId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(null);
                          setCatForm({ name: "", description: "", image: "", menuType: "cafe", isActive: true });
                        }}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-500 hover:bg-neutral-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-black text-white hover:bg-red-700 shadow-sm transition uppercase tracking-wider"
                    >
                      {editingCatId ? "Update Category" : "Create Category"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Category Search Input */}
              <div className="mb-4">
                <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2 flex-1 max-w-md">
                  <FaSearch className="text-neutral-400 text-xs" />
                  <input
                    className="w-full bg-transparent text-xs text-neutral-800 outline-none placeholder:text-neutral-400 font-medium"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="Search categories easily..."
                  />
                </label>
              </div>

              {/* Categories Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse" aria-label="Categories Table">
                  <thead>
                    <tr className="border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      <th className="py-3 px-2">Image</th>
                      <th className="py-3 px-2">Category Name</th>
                      <th className="py-3 px-2">Menu Type</th>
                      <th className="py-3 px-2">Description</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Product Count</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600 font-semibold">
                    {filteredCategories.map((cat) => {
                      const prodCount = items.filter(item => {
                        const itemCatId = item.category?._id || item.category;
                        return itemCatId === cat._id;
                      }).length;
                      
                      return (
                        <tr key={cat._id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-2 px-2">
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-neutral-100 shadow-sm"
                              src={cat.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"}
                              alt={cat.name}
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80";
                              }}
                            />
                          </td>
                          <td className="py-2 px-2 font-black text-neutral-800">
                            {cat.name}
                          </td>
                          <td className="py-2 px-2 text-neutral-500 font-bold uppercase">
                            {cat.menuType || "cafe"}
                          </td>
                          <td className="py-2 px-2 text-neutral-500 font-medium line-clamp-2 max-w-xs">
                            {cat.description || "No description provided."}
                          </td>
                          <td className="py-2 px-2">
                            <button
                              type="button"
                              onClick={() => toggleCategoryStatus(cat)}
                              className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition ${
                                cat.isActive !== false
                                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                  : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                              }`}
                            >
                              {cat.isActive !== false ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="py-2 px-2 text-neutral-500 font-bold">
                            {prodCount} Items
                          </td>
                          <td className="py-2 px-2 text-right">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => startEditCategory(cat)}
                                className="rounded-xl bg-white p-2 text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:bg-neutral-50 shadow-sm"
                                aria-label={`Edit Category ${cat.name}`}
                              >
                                <FaPen size={9} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="rounded-xl bg-red-50 p-2 text-red-600 hover:text-red-700 border border-red-100 hover:bg-red-100/50"
                                aria-label={`Delete Category ${cat.name}`}
                              >
                                <FaTrash size={9} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {(!filteredCategories || filteredCategories.length === 0) && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-neutral-400">
                          No categories match the search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

    </section>
  );
}
