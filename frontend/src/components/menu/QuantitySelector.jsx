import React from 'react';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus } from 'react-icons/fi';

const QuantitySelector = ({ value, onChange, min = 1, max = 10 }) => {
  return (
    <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-2 w-fit">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="p-1.5 rounded-md hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiMinus size={16} className="text-dark-300" />
      </motion.button>
      
      <span className="text-white font-semibold w-8 text-center text-sm">
        {value}
      </span>
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="p-1.5 rounded-md hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FiPlus size={16} className="text-dark-300" />
      </motion.button>
    </div>
  );
};

export default QuantitySelector;
