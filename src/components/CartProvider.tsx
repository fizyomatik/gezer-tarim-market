'use client';

import { createContext, startTransition, useContext, useEffect, useState } from 'react';
import type { Product } from '../data/products';
import { restoreCart, type CartItem } from '../lib/cart';

type CartContextValue = { items: CartItem[]; addItem: (product: Product) => void; decreaseItem: (id: string) => void; removeItem: (id: string) => void; clearCart: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let restored: CartItem[] = [];
    try { restored = restoreCart(window.localStorage.getItem('gezer-cart') ?? '[]'); } catch { /* Storage may be disabled. */ }
    startTransition(() => { setItems(restored); setHydrated(true); });
  }, []);
  useEffect(() => {
    if (hydrated) {
      try { window.localStorage.setItem('gezer-cart', JSON.stringify(items)); } catch { /* In-memory cart remains usable. */ }
    }
  }, [hydrated, items]);
  const addItem = (product: Product) => setItems((current) => {
    const existing = current.find((item) => item.id === product.id);
    return existing ? current.map((item) => item.id === product.id ? { ...product, quantity: Math.min(item.quantity + 1, 999) } : item) : [...current, { ...product, quantity: 1 }];
  });
  const decreaseItem = (id: string) => setItems((current) => current.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []));
  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  return <CartContext.Provider value={{ items, addItem, decreaseItem, removeItem, clearCart: () => setItems([]) }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('CartProvider is required');
  return context;
}
