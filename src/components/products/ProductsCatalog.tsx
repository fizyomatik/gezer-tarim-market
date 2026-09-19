import { Search } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import type { Product } from '../../data/products';
import type { Category } from '../../lib/catalog';

export default function ProductsCatalog({ products, categories, initialQuery, category }: { products: Product[]; categories: Category[]; initialQuery: string; category: string }) {
  const query = initialQuery.trim().toLocaleLowerCase('tr-TR');
  const filtered = products.filter((product) => (!query || `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase('tr-TR').includes(query)) && (!category || product.categorySlug === category));
  const unknownCategory = category && !categories.some((item) => item.slug === category);
  return <main className="bg-[#f7f8f4] py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="max-w-2xl"><span className="text-sm font-bold tracking-[0.2em] text-[#a5c63b]">ÜRÜN KATALOĞU</span><h1 className="mt-3 text-4xl font-black text-[#174d32] md:text-5xl">Ürünler</h1><p className="mt-4 leading-7 text-gray-600">Ürünleri keşfedin, bilgi talep listenize ekleyin ve WhatsApp üzerinden bize ulaşın.</p></div>
    <form action="/products" className="mt-10 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <label className="min-w-48 flex-1"><span className="mb-2 flex items-center gap-2 text-sm font-semibold"><Search size={17} /> Ürün, marka veya kategori ara</span><input type="search" name="q" defaultValue={initialQuery} className="w-full rounded border border-gray-300 px-3 py-3" /></label>
      <label><span className="mb-2 block text-sm font-semibold">Kategori</span><select name="category" defaultValue={category} className="max-w-full rounded border border-gray-300 px-3 py-3"><option value="">Tüm kategoriler</option>{unknownCategory && <option value={category}>Kategori kullanılamıyor</option>}{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
      <button className="rounded bg-[#174d32] px-5 py-3 font-bold text-white">Filtrele</button><Link href="/products" className="px-3 py-3 underline">Temizle</Link>
    </form>
    {filtered.length ? <><p className="mt-6 text-sm text-gray-600">{filtered.length} ürün</p><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div></> : <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">{unknownCategory ? 'Bu kategori kullanılamıyor. Diğer kategorileri inceleyebilirsiniz.' : 'Aramanızla eşleşen ürün bulunamadı.'}</div>}
  </div></main>;
}
