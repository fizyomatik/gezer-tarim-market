'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '../../../data/products';
import type { Category } from '../../../lib/catalog';
import { validateImages } from '../../../lib/validation';
import { uploadImages } from '../../../lib/upload';
import ImagePreview from '../../../components/ImagePreview';
import { abandonUploads } from '../media-actions';
import { createProduct, deleteProduct, updateProduct } from './actions';

type SelectedImage = { key: string; file?: File; path?: string; url?: string };
export default function AdminProductsClient({ initialProducts, categories }: { initialProducts: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  function edit(product: Product | null) {
    setEditing(product);
    setImages((product?.imagePaths ?? []).map((path, index) => ({ key: path, path, url: product?.images?.[index] })));
    setRevision((value) => value + 1);
  }
  function move(index: number, offset: number) {
    setImages((current) => {
      const next = [...current];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    data.delete('photos');
    const files = images.flatMap((image) => image.file ? [image.file] : []);
    const validation = validateImages(files);
    if (validation || images.length > 10) { setMessage(validation || 'En fazla 10 görsel olabilir.'); return; }
    setPending(true); setMessage('');
    try {
      const paths = await uploadImages('product-images', files);
      let nextPath = 0;
      images.forEach((image) => data.append('imagePath', image.path ?? paths[nextPath++]));
      const result = editing ? await updateProduct(editing.id, data) : await createProduct(data);
      if (result.error) {
        await abandonUploads('product-images', paths).catch(() => undefined);
        setMessage(result.error); return;
      }
      edit(null); setMessage('Ürün kaydedildi.'); router.refresh();
    } catch { setMessage('İşlem tamamlanamadı. Tekrar kaydetmeden önce sayfayı yenileyip listeyi kontrol edin.'); }
    finally { setPending(false); }
  }
  async function remove(id: string) {
    if (pending || !window.confirm('Bu ürünü silmek istiyor musunuz?')) return;
    setPending(true);
    try {
      const result = await deleteProduct(id);
      setMessage(result.error || 'Ürün silindi.');
      if (!result.error) { if (editing?.id === id) edit(null); router.refresh(); }
    } catch { setMessage('Ürün silinemedi. Lütfen tekrar deneyin.'); }
    finally { setPending(false); }
  }
  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2.5';
  return <div className="space-y-8">
    <div><h1 className="text-3xl font-black text-[#174d32]">Ürün yönetimi</h1><p>{initialProducts.length} ürün listeleniyor.</p></div>
    {!categories.length && <p role="status">Ürün eklemeden önce Kategoriler bölümünden bir kategori oluşturun.</p>}
    <form key={revision} onSubmit={submit} className="rounded-xl border bg-white p-6">
      <fieldset disabled={pending || !categories.length} className="grid gap-4 md:grid-cols-2">
        <label>Ürün adı<input className={input} name="name" required maxLength={200} defaultValue={editing?.name} /></label>
        <label>Marka<input className={input} name="brand" maxLength={120} defaultValue={editing?.brand} /></label>
        <label>Kategori<select className={input} name="categorySlug" required defaultValue={editing?.categorySlug ?? categories[0]?.slug}>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}{!category.isActive && ' (pasif)'}</option>)}
        </select></label>
        <label>Fiyat (₺, isteğe bağlı)<input className={input} name="price" min="0" max="9999999999.99" step="0.01" type="number" defaultValue={editing?.price ?? ''} /><span className="text-sm text-gray-500">Boş bırakırsanız fiyat için iletişim bilgisi gösterilir.</span></label>
        <label className="md:col-span-2">Açıklama<textarea className={input} name="description" maxLength={10000} defaultValue={editing?.description} /></label>
        <label><input name="featured" type="checkbox" defaultChecked={editing?.featured ?? false} /> Öne çıkan ürün</label>
        <label><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} /> Yayında (kategori de aktif olmalıdır)</label>
        <div className="md:col-span-2"><p className="mb-3">Görseller — ilk görsel kapaktır ({images.length}/10)</p>
          <ol className="flex flex-wrap gap-4">{images.map((image, index) => <li key={image.key} className="space-y-2 rounded border p-3">
            <ImagePreview file={image.file} src={image.url} alt={`${index + 1}. ürün görseli`} />
            <div className="flex gap-3"><button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`${index + 1}. görseli önceye taşı`}>←</button>
              <button type="button" disabled={index === images.length - 1} onClick={() => move(index, 1)} aria-label={`${index + 1}. görseli sonraya taşı`}>→</button>
              <button type="button" onClick={() => setImages((current) => current.filter((item) => item.key !== image.key))} className="text-red-700">Kaldır</button></div>
          </li>)}</ol>
        </div>
        <label className="md:col-span-2">Görsel ekle (JPG, PNG, WEBP; dosya başına 10 MB)
          <input className={input} name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            const error = validateImages(files);
            if (error || images.length + files.length > 10) setMessage(error || 'Toplam en fazla 10 görsel olabilir.');
            else setImages((current) => [...current, ...files.map((file) => ({ key: crypto.randomUUID(), file }))]);
            event.target.value = '';
          }} />
        </label>
        <button className="rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white disabled:opacity-50">{pending ? 'Kaydediliyor…' : editing ? 'Ürünü güncelle' : 'Ürün ekle'}</button>
        {editing && <button type="button" onClick={() => edit(null)}>Düzenlemeyi iptal et</button>}
      </fieldset>
    </form>
    {message && <p role="status">{message}</p>}
    {!initialProducts.length && <p>Henüz ürün eklenmedi.</p>}
    <div className="divide-y rounded-xl border bg-white">{initialProducts.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
      <div><p className="font-bold">{product.name}</p><p>{product.category} · {product.active ? 'Yayında' : 'Pasif'}</p></div>
      <div className="flex gap-3"><button disabled={pending} onClick={() => edit(product)}>Düzenle</button><button disabled={pending} onClick={() => remove(product.id)} className="text-red-700">Sil</button></div>
    </div>)}</div>
  </div>;
}
