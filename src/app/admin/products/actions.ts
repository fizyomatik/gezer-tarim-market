'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/auth';
import { drainStorageCleanup } from '../../../lib/storage';
import { isUuid, validateProduct } from '../../../lib/validation';

type ProductState = { error: string };

async function saveProduct(productId: string | null, formData: FormData): Promise<ProductState> {
  const { supabase } = await requireAdmin();
  const parsed = validateProduct(formData);
  if (parsed.error) return { error: parsed.error };
  if (productId !== null && !isUuid(productId)) return { error: 'Geçersiz ürün.' };
  const { error } = await supabase.rpc('save_product', { product_id: productId, ...parsed.value });
  if (error) return { error: 'Ürün kaydedilemedi. Bilgileri kontrol edip tekrar deneyin.' };
  revalidatePath('/', 'layout');
  return { error: '' };
}

export async function createProduct(formData: FormData): Promise<ProductState> {
  return saveProduct(null, formData);
}

export async function updateProduct(productId: string, formData: FormData): Promise<ProductState> {
  return saveProduct(productId, formData);
}

export async function deleteProduct(productId: string): Promise<ProductState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(productId)) return { error: 'Geçersiz ürün.' };
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) return { error: 'Ürün silinemedi. Lütfen tekrar deneyin.' };
  // The delete trigger enqueues files in the same database transaction.
  await drainStorageCleanup(supabase).catch(() => undefined);
  revalidatePath('/', 'layout');
  return { error: '' };
}
