import React from "react";
import { motion } from "framer-motion";
import { FaPizzaSlice, FaUtensils, FaCoffee, FaHamburger } from "react-icons/fa";
import { GiFrenchFries } from "react-icons/gi";

const categoryIcons = {
  Pizza: FaPizzaSlice,
  Burgers: FaHamburger,
  Fries: GiFrenchFries,
  Beverages: FaCoffee,
};

const CategoryList = ({ categories = [], active, onSelect }) => {
  return (
    <div className="flex gap-2.5 overflow-x-auto py-2 mb-4 scrollbar-hide select-none px-4">
      {categories.map((category, index) => {
        const IconComponent = categoryIcons[category.name] || FaUtensils;
        const isActive = active === category.name;

        return (
          <motion.button
            key={category._id || category.name}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(category.name)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 flex-shrink-0 border ${
              isActive
                ? "bg-red-600 border-red-600 text-white shadow-sm"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <IconComponent size={14} className={isActive ? "text-white" : "text-neutral-500"} />
            {category.name}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryList;
