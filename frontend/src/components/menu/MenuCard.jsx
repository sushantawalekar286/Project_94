import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import QuantitySelector from "./QuantitySelector";
import { Button } from "../common/Button";
import toast from "react-hot-toast";

const MenuCard = ({ item, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const [portionType, setPortionType] = useState(item.pricingType === "half-full" ? "full" : "single");
  const [loading, setLoading] = useState(false);

  const isAvailable = item.available ?? item.isAvailable ?? true;

  const displayPrice = useMemo(() => {
    if (item.pricingType === "half-full") {
      return portionType === "half" ? Number(item.halfPrice ?? item.price ?? 0) : Number(item.fullPrice ?? item.price ?? 0);
    }
    return Number(item.singlePrice ?? item.price ?? 0);
  }, [item, portionType]);

  const handleAdd = async () => {
    if (!isAvailable) return;
    setLoading(true);
    try {
      onAdd(item, quantity, portionType, displayPrice);
      setQuantity(1);
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={isAvailable ? { y: -8, scale: 1.02 } : {}}
      className={`card flex flex-col overflow-hidden transition-all duration-300 ${!isAvailable ? "opacity-60 relative" : ""}`}
    >
      <div className="relative mb-4 h-48 overflow-hidden rounded-xl">
        <motion.img
          src={item.imageUrl || item.image || "https://via.placeholder.com/320x180?text=" + item.name}
          alt={item.name}
          className="h-full w-full object-cover"
          whileHover={isAvailable ? { scale: 1.1 } : {}}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute right-3 top-3 rounded-full bg-primary-500/90 px-3 py-1 text-sm font-bold text-white backdrop-blur">
          ₹{displayPrice}
        </div>
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <span className="rounded-lg bg-red-600/90 px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white">{item.name}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-dark-400">{item.description}</p>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} size={14} className={i < (item.rating || 4) ? "fill-gold-500 text-gold-500" : "text-dark-600"} />
            ))}
          </div>
          <span className="text-xs text-dark-400">({item.reviews || 0})</span>
        </div>

        {item.pricingType === "half-full" && (
          <div className="mb-4 flex gap-2">
            {[
              ["half", `Half ₹${item.halfPrice ?? item.price ?? 0}`],
              ["full", `Full ₹${item.fullPrice ?? item.price ?? 0}`]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && setPortionType(value)}
                className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                  portionType === value
                    ? "border-gold-400 bg-gold-400/15 text-gold-400"
                    : "border-white/10 bg-white/5 text-white/70"
                } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3">
          <QuantitySelector value={quantity} onChange={setQuantity} disabled={!isAvailable} />
          <Button
            variant="primary"
            size="md"
            onClick={handleAdd}
            loading={loading}
            disabled={!isAvailable}
            className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={18} />
            {isAvailable ? "Add" : "Unavailable"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
