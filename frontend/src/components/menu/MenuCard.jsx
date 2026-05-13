import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import QuantitySelector from './QuantitySelector';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

const MenuCard = ({ item, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      onAdd(item, quantity);
      setQuantity(1);
      toast.success(`${item.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="card overflow-hidden flex flex-col"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-xl mb-4">
        <motion.img
          src={item.imageUrl || 'https://via.placeholder.com/320x180?text=' + item.name}
          alt={item.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute top-3 right-3 bg-primary-500/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-white">
          ${item.price}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {item.name}
        </h3>

        <p className="text-dark-400 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={14}
                className={i < (item.rating || 4) ? 'fill-gold-500 text-gold-500' : 'text-dark-600'}
              />
            ))}
          </div>
          <span className="text-xs text-dark-400">({item.reviews || 0})</span>
        </div>

        {/* Quantity & Button */}
        <div className="flex items-center gap-3 mt-auto">
          <QuantitySelector value={quantity} onChange={setQuantity} />
          <Button
            variant="primary"
            size="md"
            onClick={handleAdd}
            loading={loading}
            className="flex-1"
          >
            <FiShoppingCart size={18} />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
