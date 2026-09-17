'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateImages } from '../../../lib/validation';
import { uploadImages } from '../../../lib/upload';
import { abandonUploads } from '../media-actions';
import { createSlide, deleteSlide, toggleSlide } from './actions';

type AdminSlide = { id: string; title: string; text: string; href: string; image: string; sortOrder: number; isActive: boolean };

export default function AdminSlidesClient({ initialSlides }: { initialSlides: AdminSlide[] }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('photo');
    if (!(file instanceof File) || !file.size) { setMessage('Görsel seçin.'); return; }
    const validation = validateImages([file]);
    if (validation) { setMessage(validation); return; }
    data.delete('photo');
    setPending(true);
    try {
      const paths = await uploadImages('site-media', [file]);
      data.set('imagePath', paths[0]);
      const result = await createSlide(data);
      if (result.error) { await abandonUploads('site-media', paths).catch(() => undefined); setMessage(result.error); return; }
      form.reset();
      setMessage('Slayt eklendi.');
      router.refresh();
    } catch { setMessage('İşlem tamamlanamadı. Sayfayı yenileyip slayt listesini kontrol edin.'); }
    finally { setPending(false); }
  }

  async function change(slide: AdminSlide, remove: boolean) {
    if (pending || (remove && !window.confirm('Bu slaytı silmek istiyor musunuz?'))) return;
    setPending(true);
    try {
      const result = remove ? await deleteSlide(slide.id) : await toggleSlide(slide.id, !slide.isActive);
      setMessage(result.error || 'Slayt güncellendi.');
      if (!result.error) router.refresh();
    } catch { setMessage('İşlem tamamlanamadı. Lütfen tekrar deneyin.'); }
    finally { setPending(false); }
  }

  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2.5';
  return <div className="space-y-8">
    <h1 className="text-3xl font-black text-[#174d32]">Slayt yönetimi</h1>
    <form onSubmit={submit} className="rounded-xl border bg-white p-6">
      <fieldset disabled={pending} className="grid gap-4">
        <label>Başlık<input className={input} name="title" required maxLength={200} /></label>
        <label>Açıklama<textarea className={input} name="text" maxLength={2000} /></label>
        <label>Site içi bağlantı<input className={input} name="href" required defaultValue="/products" /></label>
        <label>Görsel (JPG, PNG, WEBP; en fazla 10 MB)<input className={input} name="photo" required type="file" accept="image/jpeg,image/png,image/webp" /></label>
        <button className="rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white">{pending ? 'Kaydediliyor…' : 'Slayt ekle'}</button>
      </fieldset>
    </form>
    {message && <p role="status">{message}</p>}
    {!initialSlides.length && <p>Henüz slayt eklenmedi.</p>}
    <div className="grid gap-4">{initialSlides.map((slide) => <article key={slide.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4">
      <Image src={slide.image} alt={slide.title} width={160} height={90} className="h-20 w-32 rounded-lg object-cover" />
      <div className="min-w-48 flex-1"><h2 className="font-bold">{slide.title}</h2><p>{slide.isActive ? 'Yayında' : 'Pasif'}</p></div>
      <button disabled={pending} onClick={() => change(slide, false)}>{slide.isActive ? 'Pasifleştir' : 'Yayınla'}</button>
      <button disabled={pending} onClick={() => change(slide, true)} className="text-red-700">Sil</button>
    </article>)}</div>
  </div>;
}
