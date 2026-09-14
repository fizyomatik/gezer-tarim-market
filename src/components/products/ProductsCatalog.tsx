"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "../../data/products";

export default function ProductsCatalog({ products, initialQuery, category }: { products: Product[]; initialQuery: string; category: string }) {
  const [query, setQuery] = useState(initialQuery);
  const filtered = useMemo(() => products.filter((product) => { const text = `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase("tr-TR"); return (!query || text.includes(query.toLocaleLowerCase("tr-TR"))) && (!category || product.categorySlug === category); }), [category, products, query]);
  return <main className="bg-[#f7f8f4] py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="max-w-2xl"><span className="text-sm font-bold tracking-[0.2em] text-[#a5c63b]">GEZER KATALOĞU</span><h1 className="mt-3 text-4xl font-black text-[#174d32] md:text-5xl">Ürünler</h1><p className="mt-4 leading-7 text-gray-600">Üretiminiz için seçtiğimiz ürünleri keşfedin. Fiyat ve stok bilgisi için bizimle iletişime geçebilirsiniz.</p></div><div className="mt-10 flex max-w-xl items-center gap-3 rounded-xl border border-gray-200 bg-white px-4"><Search className="text-gray-400" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ürün, marka veya kategori ara..." className="w-full py-4 outline-none" /></div>{filtered.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">Aramanızla eşleşen ürün bulunamadı.</div>}</div></main>;
}