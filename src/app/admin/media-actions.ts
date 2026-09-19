'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../lib/auth';
import { drainStorageCleanup } from '../../lib/storage';
import { isUploadPath } from '../../lib/validation';

export async function reserveUploads(bucket: string, paths: string[]) {
  const { supabase } = await requireAdmin();
  if (!['product-images', 'site-media'].includes(bucket) || paths.length > 10 || paths.some((path) => !isUploadPath(path))) {
    return { error: 'Geçersiz görsel.' };
  }
  if (!paths.length) return { error: '' };
  const { error } = await supabase.from('storage_cleanup').insert(paths.map((path) => ({ bucket, path })));
  return { error: error ? 'Görsel yüklemesi hazırlanamadı.' : '' };
}

export async function abandonUploads(bucket: string, paths: string[]) {
  const { supabase } = await requireAdmin();
  if (!['product-images', 'site-media'].includes(bucket) || paths.length > 10 || paths.some((path) => !isUploadPath(path))) return;
  if (!paths.length) return;
  const { error } = await supabase.from('storage_cleanup').update({ ready_at: new Date().toISOString() }).eq('bucket', bucket).in('path', paths);
  if (error) throw new Error('Görsel temizliği ertelendi.');
  await drainStorageCleanup(supabase);
}

export async function retryCleanup() {
  const { supabase } = await requireAdmin();
  try {
    const { failed } = await drainStorageCleanup(supabase);
    revalidatePath('/admin');
    return { message: failed ? `${failed} görsel temizlenemedi; yeniden deneyebilirsiniz.` : 'Bir grup işlendi. Bekleyen kayıt varsa yeniden çalıştırın.' };
  } catch { return { message: 'Temizlik yapılamadı. Lütfen tekrar deneyin.' }; }
}
