import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import toast from "react-hot-toast";

const MenuCard = ({ item }) => {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [portionType, setPortionType] = useState(item.pricingType === "half-full" ? "full" : "single");

  const isAvailable = item.available ?? item.isAvailable ?? true;

  const displayPrice = useMemo(() => {
    if (item.pricingType === "half-full") {
      return portionType === "half" ? Number(item.halfPrice ?? item.price ?? 0) : Number(item.fullPrice ?? item.price ?? 0);
    }
    return Number(item.singlePrice ?? item.price ?? 0);
  }, [item, portionType]);

  // Find if this item + portion is currently in cart
  const cartItem = useMemo(() => {
    return items.find(
      (entry) => entry.menuItem === item._id && (entry.portionType || "single") === portionType
    );
  }, [items, item._id, portionType]);

  const cartItemQuantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (!isAvailable) return;
    try {
      addItem({
        menuItem: item._id,
        name: item.name,
        price: displayPrice,
        quantity: 1,
        imageUrl: item.imageUrl || item.image,
        portionType
      });
      toast.success(`${item.name} (${portionType}) added to cart`);
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleQuantityChange = (newQty) => {
    if (newQty <= 0) {
      removeItem(item._id, portionType);
      toast.success(`${item.name} (${portionType}) removed from cart`);
    } else {
      updateQuantity(item._id, newQty, portionType);
    }
  };

  return (
    <div className="flex justify-between items-start gap-4 py-4 px-2 sm:px-3 bg-white hover:bg-neutral-50/50 transition-colors duration-200 border-b border-neutral-100 last:border-b-0">
      
      {/* Left Column: Product Info */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Veg/Non-Veg & Spice level badges */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border ${item.vegetarian ? "border-green-600" : "border-red-600"} p-0.5 rounded`}>
            <span className={`w-1.5 h-1.5 rounded-full ${item.vegetarian ? "bg-green-600" : "bg-red-600"}`}></span>
          </span>
          
          {item.spiceLevel > 1 && (
            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">
              🌶️ Spicy x{item.spiceLevel}
            </span>
          )}
          
          {item.vegan && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
              Vegan
            </span>
          )}
        </div>

        {/* Item Name */}
        <h3 className="text-sm sm:text-base font-black text-neutral-800 leading-tight mb-1 truncate">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-neutral-400 font-normal line-clamp-2 mb-2 pr-1 leading-relaxed">
          {item.description || "Freshly prepared house special using premium ingredients."}
        </p>

        {/* Price & Rating */}
        <div className="flex items-center gap-3 mt-auto">
          <span className="text-sm sm:text-base font-extrabold text-red-600">
            ₹{displayPrice}
          </span>
          
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
            <span className="text-amber-500">★</span>
            <span>{item.rating || (4.2 + (item.name.length % 7) / 10).toFixed(1)}</span>
          </div>
        </div>

        {/* Half/Full Switcher */}
        {item.pricingType === "half-full" && (
          <div className="mt-3 flex gap-2">
            {[
              ["half", `Half (₹${item.halfPrice ?? item.price ?? 0})`],
              ["full", `Full (₹${item.fullPrice ?? item.price ?? 0})`]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && setPortionType(value)}
                className={`rounded-full border px-2.5 py-1 text-[9px] font-bold transition-all duration-150 ${
                  portionType === value
                    ? "border-red-600 bg-red-50 text-red-600"
                    : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
                } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Right Column: Image and ADD button overlay */}
      <div className="relative flex-shrink-0 flex flex-col items-center">
        
        {/* Uniform square food image */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100 shadow-sm relative">
          <img
            src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"}
            alt={item.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 ${
              isAvailable ? "hover:scale-105" : "filter grayscale opacity-60"
            }`}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
            }}
          />
          
          {/* Availability overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <span className="rounded bg-red-600 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Floating Add / Quantity selector Button */}
        <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 z-10 w-20">
          {isAvailable ? (
            cartItemQuantity > 0 ? (
              <div className="flex items-center justify-between rounded-xl bg-white border border-red-600 text-red-600 font-extrabold text-sm h-7.5 shadow-md overflow-hidden">
                <button
                  type="button"
                  className="w-6.5 h-full flex items-center justify-center hover:bg-red-50 text-red-600 font-black transition-colors"
                  onClick={() => handleQuantityChange(cartItemQuantity - 1)}
                >
                  -
                </button>
                <span className="w-7 text-center font-black text-red-600 select-none text-xs">
                  {cartItemQuantity}
                </span>
                <button
                  type="button"
                  className="w-6.5 h-full flex items-center justify-center hover:bg-red-50 text-red-600 font-black transition-colors"
                  onClick={() => handleQuantityChange(cartItemQuantity + 1)}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-xl bg-white border border-red-600 text-red-600 font-black text-xs py-1.5 shadow-md hover:bg-red-50 active:scale-95 transition-all duration-150 uppercase tracking-wide text-center"
              >
                ADD
              </button>
            )
          ) : (
            <div className="w-full rounded-xl bg-neutral-200 border border-neutral-300 text-neutral-400 font-bold text-[9px] py-1 shadow-sm text-center uppercase tracking-wide">
              OUT
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default MenuCard;
