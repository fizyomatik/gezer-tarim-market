"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, MessageCircle, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "../../data/products";
import { formatPrice } from "../../data/products";
import { useCart } from "../CartProvider";
import WhatsAppLink from "../WhatsAppLink";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  };
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <Link href={`/products/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-gray-100"><Image src={product.image} alt={product.name} width={640} height={480} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></Link>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#a5c63b]">{product.category}</p>
        <Link href={`/products/${product.slug}`} className="mt-2 block text-lg font-black text-[#174d32] hover:text-[#a5c63b]">{product.name}</Link>
        <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
      <div className="mt-5 flex items-center justify-between gap-3"><strong className="text-lg text-gray-900">{formatPrice(product.price)}</strong><div className="flex gap-2"><WhatsAppLink title="WhatsApp ile bilgi al" message={`Merhaba, ${product.name} hakkında bilgi almak istiyorum.`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-[#174d32] hover:bg-[#f3f7e7]"><MessageCircle size={17} /></WhatsAppLink><button title="Sepete ekle" onClick={handleAdd} aria-label={`${product.name} sepete ekle`} className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#174d32] text-white hover:bg-[#123d27]">{added ? <Check size={17} /> : <ShoppingBag size={17} />}</button></div></div>
      </div>
    </article>
  );
}
