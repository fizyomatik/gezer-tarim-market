'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/auth';
import { drainStorageCleanup } from '../../../lib/storage';
import { isInternalLink, isUploadPath, isUuid } from '../../../lib/validation';

export async function createSlide(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  const text = String(formData.get('text') ?? '').trim();
  const href = String(formData.get('href') ?? '/products').trim();
  const imagePath = String(formData.get('imagePath') ?? '');
  if (!title || title.length > 200 || text.length > 2000 || !isInternalLink(href) || !isUploadPath(imagePath)) {
    return { error: 'Başlık, site içi bağlantı ve görseli kontrol edin.' };
  }
  const last = await supabase.from('slides').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
  if (last.error) return { error: 'Slayt sırası okunamadı.' };
  const { error } = await supabase.from('slides').insert({ title, text, href, image_path: imagePath, sort_order: (last.data?.sort_order ?? -1) + 1 });
  if (error) return { error: 'Slayt kaydedilemedi. Lütfen tekrar deneyin.' };
  revalidatePath('/', 'layout');
  return { error: '' };
}

export async function toggleSlide(id: string, isActive: boolean) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id) || typeof isActive !== 'boolean') return { error: 'Geçersiz slayt.' };
  const { error } = await supabase.from('slides').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { error: 'Slayt güncellenemedi.' };
  revalidatePath('/', 'layout');
  return { error: '' };
}

export async function deleteSlide(id: string) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) return { error: 'Geçersiz slayt.' };
  const { error } = await supabase.from('slides').delete().eq('id', id);
  if (error) return { error: 'Slayt silinemedi.' };
  await drainStorageCleanup(supabase).catch(() => undefined);
  revalidatePath('/', 'layout');
  return { error: '' };
}
