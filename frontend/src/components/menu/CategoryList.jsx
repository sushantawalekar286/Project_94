import React from "react";
import { motion } from "framer-motion";

const getCategoryIconUrl = (categoryName) => {
  const name = categoryName.toLowerCase();
  if (name === "all") return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("pizza")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("burger")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("fries")) return "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("noodle") || name.includes("chinese") || name.includes("chopsuey")) return "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("beverage") || name.includes("drink") || name.includes("mocktail") || name.includes("coffee") || name.includes("shake")) return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("momo")) return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("roll")) return "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("ice cream")) return "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("sandwich") || name.includes("toast")) return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("soup")) return "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("rice")) return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=150&h=150&q=80";
  if (name.includes("chicken")) return "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=150&h=150&q=80";
  return "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=150&h=150&q=80";
};

const CategoryList = ({ categories = [], active, onSelect }) => {
  return (
    <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide select-none px-4 bg-transparent">
      {categories.map((category) => {
        const isActive = active === category.name;
        const imageUrl = category.image || category.imageUrl || getCategoryIconUrl(category.name);

        return (
          <motion.div
            key={category._id || category.name}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(category.name)}
            className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <div
              className={`h-16 w-16 rounded-full border-2 bg-white flex items-center justify-center overflow-hidden transition-all duration-300 relative shadow-sm ${
                isActive
                  ? "border-orange-500 scale-105 shadow-md shadow-orange-500/10"
                  : "border-neutral-100 hover:border-neutral-200"
              }`}
            >
              <img
                src={imageUrl}
                alt={category.name}
                className={`h-full w-full object-cover transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
                loading="lazy"
              />
              {isActive && (
                <div className="absolute inset-0 bg-orange-500/5 transition-opacity" />
              )}
            </div>
            <span
              className={`text-[10px] font-bold text-center tracking-tight transition-colors ${
                isActive ? "text-orange-600 font-extrabold" : "text-neutral-500 font-semibold"
              }`}
            >
              {category.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CategoryList;
