"use client";

import { createContext, startTransition, useContext, useEffect, useState } from "react";
import type { Product } from "../data/products";

export type CartItem = Product & { quantity: number };
type CartContextValue = { items: CartItem[]; addItem: (product: Product) => void; decreaseItem: (id: string) => void; removeItem: (id: string) => void; clearCart: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("gezer-cart");
    if (saved) {
      try {
        const restoredItems = (JSON.parse(saved) as Array<Product | CartItem>).map((item) => ({ ...item, quantity: "quantity" in item ? item.quantity : 1 }));
        startTransition(() => setItems(restoredItems));
      } catch {
        window.localStorage.removeItem("gezer-cart");
      }
    }
    startTransition(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("gezer-cart", JSON.stringify(items));
  }, [hydrated, items]);
  const addItem = (product: Product) => setItems((current) => {
    const existing = current.find((item) => item.id === product.id);
    return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
  });
  const decreaseItem = (id: string) => setItems((current) => current.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []));
  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  return <CartContext.Provider value={{ items, addItem, decreaseItem, removeItem, clearCart: () => setItems([]) }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
