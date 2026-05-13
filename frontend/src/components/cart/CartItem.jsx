import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import QuantitySelector from '../menu/QuantitySelector';

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  const subtotal = (item.price * (item.quantity || 1)).toFixed(2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg border border-dark-600 hover:border-primary-500/50 transition-all"
    >
      {/* Item Image */}
      <img
        src={item.imageUrl || 'https://via.placeholder.com/80?text=' + item.name}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg"
      />

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold line-clamp-1">{item.name}</h4>
        <p className="text-dark-400 text-sm">${item.price}</p>
        <p className="text-primary-500 font-bold text-sm mt-1">Subtotal: ${subtotal}</p>
      </div>

      {/* Quantity & Remove */}
      <div className="flex items-center gap-3">
        <QuantitySelector
          value={item.quantity || 1}
          onChange={(qty) => onQuantityChange(item._id || item.menuItem, qty)}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(item._id || item.menuItem)}
          className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
        >
          <FiX size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CartItem;
