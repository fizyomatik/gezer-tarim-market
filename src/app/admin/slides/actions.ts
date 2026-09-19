'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/auth';
import { drainStorageCleanup } from '../../../lib/storage';
import { isInternalLink, isUuid, isMediaPath } from '../../../lib/validation';

export async function saveSlide(id: string | null, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  const text = String(formData.get('text') ?? '').trim();
  const href = String(formData.get('href') ?? '').trim();
  const imagePath = String(formData.get('imagePath') ?? '');
  const orderText = String(formData.get('sortOrder') ?? '');
  const order = Number(orderText);
  if ((id !== null && !isUuid(id)) || !title || title.length > 200 || text.length > 2000 || !isInternalLink(href) ||
    (!imagePath || !isMediaPath(imagePath)) || !/^\d+$/.test(orderText) || !Number.isSafeInteger(order) || order > 2147483647) return { error: 'Slayt bilgilerini kontrol edin.' };
  const { error } = await supabase.rpc('save_slide', { slide_id: id, slide_title: title, slide_text: text, slide_href: href,
    media_path: imagePath, display_order: order, active: formData.get('active') === 'on' });
  if (error) return { error: 'Slayt kaydedilemedi. Görseli yeniden yükleyip tekrar deneyin.' };
  await drainStorageCleanup(supabase).catch(() => undefined);
  revalidatePath('/', 'layout');
  return { error: '' };
}
export async function deleteSlide(id: string) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) return { error: 'Geçersiz slayt.' };
  const { data, error } = await supabase.from('slides').delete().eq('id', id).select('id').maybeSingle();
  if (error || !data) return { error: 'Slayt silinemedi veya zaten silinmiş. Listeyi yenileyin.' };
  await drainStorageCleanup(supabase).catch(() => undefined);
  revalidatePath('/', 'layout');
  return { error: '' };
}
