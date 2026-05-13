import React from 'react';
import { motion } from 'framer-motion';
import { FaPizzaSlice, FaUtensils, FaCoffee, FaHamburger } from 'react-icons/fa';
import { GiFrenchFries } from 'react-icons/gi';

const categoryIcons = {
  'Pizza': FaPizzaSlice,
  'Burgers': FaHamburger,
  'Fries': GiFrenchFries,
  'Beverages': FaCoffee,
};

const CategoryList = ({ categories = [], active, onSelect }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
      {categories.map((category, index) => {
        const IconComponent = categoryIcons[category.name] || FaUtensils;
        const isActive = active === category.name;

        return (
          <motion.button
            key={category._id || category.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(category.name)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow-lg'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600'
            }`}
          >
            <IconComponent size={20} />
            {category.name}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryList;
