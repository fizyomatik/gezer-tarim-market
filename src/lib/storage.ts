import type { SupabaseClient } from '@supabase/supabase-js';

// Claims serialize against committing new uploads. Failed requests remain queued.
export async function drainStorageCleanup(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('claim_storage_cleanup');
  if (error) throw new Error('Görsel temizleme kuyruğu okunamadı.');
  let failed = 0;
  for (const item of (data ?? []) as { bucket: string; path: string }[]) {
    const tables = item.bucket === 'product-images' ? ['product_images'] : ['slides', 'categories'];
    const column = item.bucket === 'product-images' ? 'storage_path' : 'image_path';
    const references = await Promise.all(tables.map((table) => supabase.from(table).select('id').eq(column, item.path).limit(1)));
    if (references.some((reference) => reference.error)) { failed++; continue; }
    if (!references.some((reference) => reference.data?.length)) {
      const removal = await supabase.storage.from(item.bucket).remove([item.path]);
      if (removal.error) { failed++; continue; }
    }
    const cleared = await supabase.from('storage_cleanup').delete().eq('bucket', item.bucket).eq('path', item.path);
    if (cleared.error) failed++;
  }
  return { failed };
}
