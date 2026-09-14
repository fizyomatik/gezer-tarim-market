"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "../data/products";

type CartContextValue = { items: Product[]; addItem: (product: Product) => void; removeItem: (id: string) => void; clearCart: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("gezer-cart");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => { window.localStorage.setItem("gezer-cart", JSON.stringify(items)); }, [items]);
  const addItem = (product: Product) => setItems((current) => [...current, product]);
  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  return <CartContext.Provider value={{ items, addItem, removeItem, clearCart: () => setItems([]) }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
