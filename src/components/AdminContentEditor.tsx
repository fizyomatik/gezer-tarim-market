'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImages } from '../lib/upload';
import { validateImages } from '../lib/validation';
import { abandonUploads } from '../app/admin/media-actions';
import ImagePreview from './ImagePreview';

export type ContentItem = { id: string; name: string; description: string; href?: string; image: string; imagePath: string | null; sortOrder: number; isActive: boolean };
type Props = { kind: 'category' | 'slide'; items: ContentItem[]; save: (id: string | null, form: FormData) => Promise<{ error: string }>; remove: (id: string) => Promise<{ error: string }> };
export default function AdminContentEditor({ kind, items, save, remove }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [file, setFile] = useState<File>();
  const [removeImage, setRemoveImage] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const label = kind === 'category' ? 'Kategori' : 'Slayt';
  function edit(item: ContentItem | null) {
    setEditing(item); setFile(undefined); setRemoveImage(false); setRevision((value) => value + 1);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    form.delete('photo');
    if (kind === 'slide' && !file && !editing?.imagePath) { setMessage('Görsel seçin.'); return; }
    const validation = validateImages(file ? [file] : []);
    if (validation) { setMessage(validation); return; }
    setPending(true); setMessage('');
    try {
      const paths = file ? await uploadImages('site-media', [file]) : [];
      form.set('imagePath', paths[0] ?? (removeImage ? '' : editing?.imagePath ?? ''));
      const result = await save(editing?.id ?? null, form);
      if (result.error) {
        await abandonUploads('site-media', paths).catch(() => undefined);
        setMessage(result.error); return;
      }
      edit(null); setMessage(`${label} kaydedildi.`); router.refresh();
    } catch { setMessage('İşlem tamamlanamadı. Tekrar kaydetmeden önce sayfayı yenileyip listeyi kontrol edin.'); }
    finally { setPending(false); }
  }
  async function deleteItem(item: ContentItem) {
    if (pending || !window.confirm(`${item.name} silinsin mi?`)) return;
    setPending(true);
    try {
      const result = await remove(item.id);
      setMessage(result.error || `${label} silindi.`);
      if (!result.error) { if (editing?.id === item.id) edit(null); router.refresh(); }
    } catch { setMessage('Silinemedi. Lütfen tekrar deneyin.'); }
    finally { setPending(false); }
  }
  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2.5';
  return <div className="space-y-8"><h1 className="text-3xl font-black text-[#174d32]">{label} yönetimi</h1>
    <form key={revision} onSubmit={submit} className="rounded-xl border bg-white p-6">
      <fieldset disabled={pending} className="grid gap-4">
        <label>{kind === 'category' ? 'Kategori adı' : 'Başlık'}<input className={input} name={kind === 'category' ? 'name' : 'title'} required maxLength={kind === 'category' ? 120 : 200} defaultValue={editing?.name} /></label>
        <label>Açıklama<textarea className={input} name={kind === 'category' ? 'description' : 'text'} maxLength={2000} defaultValue={editing?.description} /></label>
        {kind === 'slide' && <label>Site içi bağlantı<input className={input} name="href" required maxLength={2048} defaultValue={editing?.href ?? '/products'} /></label>}
        <label>Sıra (küçük değer önce gösterilir)<input className={input} name="sortOrder" type="number" required min={0} max={2147483647} step={1} defaultValue={editing?.sortOrder ?? (items.length ? Math.max(...items.map((item) => item.sortOrder)) + 1 : 0)} /></label>
        <label><input name="active" type="checkbox" defaultChecked={editing?.isActive ?? true} /> Yayında{kind === 'category' && ' — pasif kategorinin ürünleri de gizlenir'}</label>
        {(file || (editing && !removeImage)) && <ImagePreview file={file} src={editing?.image} alt="Görsel önizlemesi" />}
        <label>Görsel {kind === 'category' ? '(isteğe bağlı)' : ''} — JPG, PNG, WEBP; en fazla 10 MB
          <input className={input} name="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
            const selected = event.target.files?.[0];
            const error = validateImages(selected ? [selected] : []);
            if (error) { setMessage(error); event.target.value = ''; setFile(undefined); }
            else { setFile(selected); if (selected) setRemoveImage(false); }
          }} />
        </label>
        {kind === 'category' && editing?.imagePath && !file && <label><input type="checkbox" checked={removeImage} onChange={(event) => setRemoveImage(event.target.checked)} /> Yüklenen görseli kaldır (varsayılan görsel kullanılır)</label>}
        {editing && <p className="text-sm text-gray-500">Yeni görsel seçmezseniz mevcut görsel korunur.</p>}
        <button className="rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white">{pending ? 'Kaydediliyor…' : editing ? `${label} güncelle` : `${label} ekle`}</button>
        {editing && <button type="button" onClick={() => edit(null)}>Düzenlemeyi iptal et</button>}
      </fieldset>
    </form>
    {message && <p role="status">{message}</p>}
    {!items.length && <p>Henüz kayıt yok.</p>}
    <div className="grid gap-4">{items.map((item) => <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4">
      <ImagePreview src={item.image} alt={item.name} />
      <div className="min-w-40 flex-1"><h2 className="font-bold">{item.name}</h2><p>{item.isActive ? 'Yayında' : 'Pasif'} · Sıra: {item.sortOrder}</p></div>
      <button disabled={pending} onClick={() => edit(item)}>Düzenle</button>
      <button disabled={pending} onClick={() => deleteItem(item)} className="text-red-700">Sil</button>
    </article>)}</div>
  </div>;
}
