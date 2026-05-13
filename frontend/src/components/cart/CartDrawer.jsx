import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiX } from 'react-icons/fi';
import CartItem from './CartItem';
import { Button } from '../common/Button';

const CartDrawer = ({ items = [], onRemove, onQuantityChange, onCheckout, open = true }) => {
  const total = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0).toFixed(2);
  const tax = (total * 0.1).toFixed(2);
  const grandTotal = (parseFloat(total) + parseFloat(tax)).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-700">
        <FiShoppingCart className="text-primary-500" size={24} />
        <h3 className="text-xl font-bold text-white flex-1">Your Cart</h3>
        {items.length > 0 && (
          <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-dark-400">
            <FiShoppingCart size={48} className="mb-3 opacity-50" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item) => (
              <CartItem
                key={item._id || item.menuItem}
                item={item}
                onRemove={onRemove}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-dark-700">
          <div className="flex justify-between text-dark-300">
            <span>Subtotal:</span>
            <span>${total}</span>
          </div>
          <div className="flex justify-between text-dark-300">
            <span>Tax (10%):</span>
            <span>${tax}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-dark-700">
            <span>Total:</span>
            <span>${grandTotal}</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={onCheckout}
            className="w-full"
          >
            <FiShoppingCart size={20} />
            Checkout
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default CartDrawer;
