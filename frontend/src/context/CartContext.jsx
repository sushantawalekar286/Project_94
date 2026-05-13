import { createContext, useMemo, useState, useCallback } from "react";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("cartItems") || "[]"));
  const [tableSession, setTableSessionState] = useState(() =>
    JSON.parse(localStorage.getItem("tableSession") || '{"tableNumber":1,"token":"","qrId":"","scannerId":""}')
  );

  const addItem = useCallback((item) => {
    setItems((current) => {
      const found = current.find((entry) => entry.menuItem === item.menuItem);
      const next = found
        ? current.map((entry) =>
          entry.menuItem === item.menuItem ? { ...entry, quantity: entry.quantity + item.quantity } : entry
        )
        : [...current, item];
      localStorage.setItem("cartItems", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((menuItem, quantity) => {
    setItems((current) => {
      const next = current
        .map((item) => (item.menuItem === menuItem ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0);
      localStorage.setItem("cartItems", JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((menuItem) => {
    setItems((current) => {
      const next = current.filter((item) => item.menuItem !== menuItem);
      localStorage.setItem("cartItems", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    localStorage.removeItem("cartItems");
    setItems([]);
  }, []);

  const setTableSession = useCallback((session) => {
    setTableSessionState((current) => {
      const next = { ...current, ...session };
      localStorage.setItem("tableSession", JSON.stringify(next));
      return next;
    });
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, total, tableSession, setTableSession, addItem, updateQuantity, removeItem, clearCart, setItems }),
    [items, total, tableSession, setTableSession, addItem, updateQuantity, removeItem, clearCart]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
