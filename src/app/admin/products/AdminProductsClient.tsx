'use client';

import { useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import type { Product } from '../../../data/products';
import { createProduct, deleteProduct, updateProduct } from './actions';

const categories = [{ name: 'Tohum', slug: 'tohum' }, { name: 'Gübre', slug: 'gubre' }, { name: 'Zirai İlaç', slug: 'zirai-ilac' }, { name: 'Tarım Aletleri', slug: 'tarim-aletleri' }, { name: 'Peyzaj', slug: 'peyzaj' }];

export default function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const files = Array.from((form.elements.namedItem('photos') as HTMLInputElement)?.files ?? []);
    const supabase = createSupabaseBrowserClient();
    for (const file of files) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
      if (error) { setMessage(error.message); return; }
      data.append('imagePath', path);
    }
    const result = editing ? await updateProduct(editing, data) : await createProduct(data);
    setMessage(result.error || 'Ürün kaydedildi.');
    if (!result.error) { form.reset(); setEditing(null); window.location.reload(); }
  }

  async function remove(id: string) {
    const result = await deleteProduct(id);
    setMessage(result.error || 'Ürün silindi.');
    if (!result.error) setProducts((current) => current.filter((product) => product.id !== id));
  }

  function edit(product: Product) {
    setEditing(product.id);
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem('name') as HTMLInputElement).value = product.name;
    (form.elements.namedItem('brand') as HTMLInputElement).value = product.brand;
    (form.elements.namedItem('price') as HTMLInputElement).value = String(product.price);
    (form.elements.namedItem('description') as HTMLTextAreaElement).value = product.description;
  }

  return <div className="space-y-8"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-[#a5c63b]">Katalog</p><h1 className="mt-2 text-3xl font-black text-[#174d32]">Ürün yönetimi</h1><p className="mt-2 text-sm text-gray-500">{products.length} ürün listeleniyor.</p></div><form ref={formRef} onSubmit={submit} className="grid gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:grid-cols-2"><input name="name" required placeholder="Ürün adı" className="rounded-lg border border-gray-200 px-3 py-2.5" /><input name="brand" placeholder="Marka" className="rounded-lg border border-gray-200 px-3 py-2.5" /><select name="categorySlug" required defaultValue="tarim-aletleri" className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select><input name="price" required min="0" step="0.01" type="number" placeholder="Fiyat (₺)" className="rounded-lg border border-gray-200 px-3 py-2.5" /><textarea name="description" placeholder="Açıklama" className="min-h-28 rounded-lg border border-gray-200 px-3 py-2.5 md:col-span-2" /><input name="photos" type="file" accept="image/*" multiple className="rounded-lg border border-gray-200 px-3 py-2.5 md:col-span-2" /><button className="rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white md:col-span-2">{editing ? 'Ürünü güncelle' : 'Ürün ekle'}</button>{message && <p className="text-sm text-[#174d32] md:col-span-2">{message}</p>}</form><div className="overflow-hidden rounded-xl border border-gray-100 bg-white"><div className="divide-y divide-gray-100">{products.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-bold text-[#174d32]">{product.name}</p><p className="text-sm text-gray-500">{product.category} · {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}</p></div><div className="flex gap-2"><button onClick={() => edit(product)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold">Düzenle</button><button onClick={() => remove(product.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">Sil</button></div></div>)}</div></div></div>;
}
