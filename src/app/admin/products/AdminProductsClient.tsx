'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '../../../data/products';
import type { Category } from '../../../lib/catalog';
import { validateImages } from '../../../lib/validation';
import { uploadImages } from '../../../lib/upload';
import { abandonUploads } from '../media-actions';
import { createProduct, deleteProduct, updateProduct } from './actions';

export default function AdminProductsClient({ initialProducts, categories }: { initialProducts: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const files = data.getAll('photos').filter((file): file is File => file instanceof File && file.size > 0);
    const validation = validateImages(files);
    if (validation) { setMessage(validation); return; }
    data.delete('photos');
    setPending(true);
    setMessage('');
    let paths: string[] = [];
    try {
      paths = await uploadImages('product-images', files);
      paths.forEach((path) => data.append('imagePath', path));
      const result = editing ? await updateProduct(editing.id, data) : await createProduct(data);
      if (result.error) {
        await abandonUploads('product-images', paths).catch(() => undefined);
        setMessage(result.error);
        return;
      }
      form.reset();
      setEditing(null);
      setMessage('Ürün kaydedildi.');
      router.refresh();
    } catch {
      // A lost action response may still have committed. Leave the reservation
      // to expire; the cleaner checks references before removing any object.
      setMessage('İşlem tamamlanamadı. Sayfayı yenileyip ürün listesini kontrol edin.');
    } finally { setPending(false); }
  }

  async function remove(id: string) {
    if (pending || !window.confirm('Bu ürünü silmek istiyor musunuz?')) return;
    setPending(true);
    try {
      const result = await deleteProduct(id);
      setMessage(result.error || 'Ürün silindi.');
      if (!result.error) { if (editing?.id === id) setEditing(null); router.refresh(); }
    } catch { setMessage('Ürün silinemedi. Lütfen tekrar deneyin.'); }
    finally { setPending(false); }
  }

  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2.5';
  return <div className="space-y-8">
    <div><h1 className="text-3xl font-black text-[#174d32]">Ürün yönetimi</h1><p>{initialProducts.length} ürün listeleniyor.</p></div>
    <form key={editing?.id ?? 'new'} onSubmit={submit} className="rounded-xl border bg-white p-6">
      <fieldset disabled={pending} className="grid gap-4 md:grid-cols-2">
        <label>Ürün adı<input className={input} name="name" required maxLength={200} defaultValue={editing?.name} /></label>
        <label>Marka<input className={input} name="brand" maxLength={120} defaultValue={editing?.brand} /></label>
        <label>Kategori<select className={input} name="categorySlug" required defaultValue={editing?.categorySlug ?? categories[0]?.slug}>
          {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
        </select></label>
        <label>Fiyat (₺)<input className={input} name="price" required min="0" max="9999999999.99" step="0.01" type="number" defaultValue={editing?.price} /></label>
        <label className="md:col-span-2">Açıklama<textarea className={input} name="description" maxLength={10000} defaultValue={editing?.description} /></label>
        <label><input name="featured" type="checkbox" defaultChecked={editing?.featured ?? false} /> Öne çıkan ürün</label>
        <label><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} /> Yayında</label>
        <label className="md:col-span-2">Yeni görseller (JPG, PNG, WEBP; en fazla 10 dosya, dosya başına 10 MB)
          <input className={input} name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        </label>
        <button className="rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white disabled:opacity-50">{pending ? 'Kaydediliyor…' : editing ? 'Ürünü güncelle' : 'Ürün ekle'}</button>
        {editing && <button type="button" onClick={() => setEditing(null)}>Düzenlemeyi iptal et</button>}
      </fieldset>
    </form>
    {message && <p role="status">{message}</p>}
    {!initialProducts.length && <p>Henüz ürün eklenmedi.</p>}
    <div className="divide-y rounded-xl border bg-white">{initialProducts.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
      <div><p className="font-bold">{product.name}</p><p>{product.category} · {product.active ? 'Yayında' : 'Pasif'}</p></div>
      <div className="flex gap-3"><button disabled={pending} onClick={() => setEditing(product)}>Düzenle</button><button disabled={pending} onClick={() => remove(product.id)} className="text-red-700">Sil</button></div>
    </div>)}</div>
  </div>;
}
