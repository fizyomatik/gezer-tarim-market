import type { SupabaseClient } from '@supabase/supabase-js';

// Failed Storage API requests leave the queue row intact for the next admin visit.
export async function drainStorageCleanup(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('storage_cleanup').select('bucket,path')
    .lte('ready_at', new Date().toISOString()).limit(50);
  if (error) throw new Error('Görsel temizleme kuyruğu okunamadı.');
  for (const item of data ?? []) {
    const table = item.bucket === 'product-images' ? 'product_images' : 'slides';
    const column = item.bucket === 'product-images' ? 'storage_path' : 'image_path';
    const references = await supabase.from(table).select('id').eq(column, item.path).limit(1);
    if (references.error) continue;
    if (!references.data?.length) {
      const removal = await supabase.storage.from(item.bucket).remove([item.path]);
      if (removal.error) continue;
    }
    await supabase.from('storage_cleanup').delete().eq('bucket', item.bucket).eq('path', item.path);
  }
}
