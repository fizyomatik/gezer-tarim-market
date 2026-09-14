'use client';

import Image from 'next/image';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import { createSlide, deleteSlide, toggleSlide } from './actions';

type AdminSlide = { id: string; title: string; text: string; href: string; image: string; sortOrder: number; isActive: boolean };

export default function AdminSlidesClient({ initialSlides }: { initialSlides: AdminSlide[] }) {
  const [slides, setSlides] = useState(initialSlides);
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = (form.elements.namedItem('photo') as HTMLInputElement).files?.[0];
    if (!file) { setMessage('Görsel seçin.'); return; }
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const supabase = createSupabaseBrowserClient();
    const upload = await supabase.storage.from('site-media').upload(path, file, { upsert: false });
    if (upload.error) { setMessage(upload.error.message); return; }
    data.set('imagePath', path);
    const result = await createSlide(data);
    setMessage(result.error || 'Slayt eklendi.');
    if (!result.error) { form.reset(); window.location.reload(); }
  }

  async function setActive(slide: AdminSlide) {
    const result = await toggleSlide(slide.id, !slide.isActive);
    if (result.error) { setMessage(result.error); return; }
    setSlides((current) => current.map((item) => item.id === slide.id ? { ...item, isActive: !item.isActive } : item));
  }

  async function remove(id: string) {
    const result = await deleteSlide(id);
    if (result.error) { setMessage(result.error); return; }
    setSlides((current) => current.filter((slide) => slide.id !== id));
  }

  return <div className="space-y-8"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-[#a5c63b]">Ana sayfa</p><h1 className="mt-2 text-3xl font-black text-[#174d32]">Slayt yönetimi</h1></div><form onSubmit={submit} className="grid gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"><input name="title" required placeholder="Başlık" className="rounded-lg border border-gray-200 px-3 py-2.5" /><textarea name="text" placeholder="Açıklama" className="min-h-24 rounded-lg border border-gray-200 px-3 py-2.5" /><input name="href" defaultValue="/products" placeholder="Bağlantı" className="rounded-lg border border-gray-200 px-3 py-2.5" /><input name="photo" required type="file" accept="image/*" className="rounded-lg border border-gray-200 px-3 py-2.5" /><button className="rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white">Slayt ekle</button>{message && <p className="text-sm text-[#174d32]">{message}</p>}</form><div className="grid gap-4">{slides.map((slide) => <article key={slide.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><Image src={slide.image} alt="" width={160} height={90} className="h-20 w-32 rounded-lg object-cover" /><div className="min-w-48 flex-1"><h2 className="font-bold text-[#174d32]">{slide.title}</h2><p className="text-sm text-gray-500">{slide.isActive ? 'Yayında' : 'Pasif'}</p></div><button onClick={() => setActive(slide)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold">{slide.isActive ? 'Pasifleştir' : 'Yayınla'}</button><button onClick={() => remove(slide.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">Sil</button></article>)}</div></div>;
}