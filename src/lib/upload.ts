import { createSupabaseBrowserClient } from './supabase/client';
import { abandonUploads, reserveUploads } from '../app/admin/media-actions';
import { validateImages } from './validation';

export async function uploadImages(bucket: 'product-images' | 'site-media', files: File[]) {
  const validation = validateImages(files);
  if (validation) throw new Error(validation);
  const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const paths = files.map((file) => `${crypto.randomUUID()}.${extensions[file.type]}`);
  const reservation = await reserveUploads(bucket, paths);
  if (reservation.error) throw new Error(reservation.error);
  try {
    const supabase = createSupabaseBrowserClient();
    for (const [index, file] of files.entries()) {
      const { error } = await supabase.storage.from(bucket).upload(paths[index], file, { upsert: false, contentType: file.type });
      if (error) throw new Error('Görsel yüklenemedi. Lütfen tekrar deneyin.');
    }
    return paths;
  } catch (error) {
    await abandonUploads(bucket, paths).catch(() => undefined); // Durable queue retries later.
    throw error;
  }
}
