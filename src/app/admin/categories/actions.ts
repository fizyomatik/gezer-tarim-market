'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/auth';
import { drainStorageCleanup } from '../../../lib/storage';
import { isUuid, isMediaPath } from '../../../lib/validation';

export async function saveCategory(id: string | null, formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const imagePath = String(formData.get('imagePath') ?? '') || null;
  const orderText = String(formData.get('sortOrder') ?? '');
  const order = Number(orderText);
  if ((id !== null && !isUuid(id)) || !name || name.length > 120 || description.length > 2000 || (imagePath !== null && !isMediaPath(imagePath)) ||
    !/^\d+$/.test(orderText) || !Number.isSafeInteger(order) || order > 2147483647) return { error: 'Kategori bilgilerini kontrol edin.' };
  const { error } = await supabase.rpc('save_category', { category_id: id, category_name: name, category_description: description,
    media_path: imagePath, display_order: order, active: formData.get('active') === 'on' });
  if (error) return { error: 'Kategori kaydedilemedi. Görseli yeniden yükleyip tekrar deneyin.' };
  await drainStorageCleanup(supabase).catch(() => undefined);
  revalidatePath('/', 'layout');
  return { error: '' };
}
export async function deleteCategory(id: string) {
  const { supabase } = await requireAdmin();
  if (!isUuid(id)) return { error: 'Geçersiz kategori.' };
  const { data, error } = await supabase.from('categories').delete().eq('id', id).select('id').maybeSingle();
  if (error?.code === '23503') return { error: 'Bu kategoride ürünler var. Önce ürünleri başka bir kategoriye taşıyın veya kategoriyi pasifleştirin.' };
  if (error || !data) return { error: 'Kategori silinemedi veya zaten silinmiş. Listeyi yenileyin.' };
  await drainStorageCleanup(supabase).catch(() => undefined);
  revalidatePath('/', 'layout');
  return { error: '' };
}
