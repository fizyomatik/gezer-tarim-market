'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/auth';

type ProductState = { error: string };

function slugify(value: string) {
  return value.toLocaleLowerCase('tr-TR').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function createProduct(formData: FormData): Promise<ProductState> {
  const { supabase } = await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  const brand = String(formData.get('brand') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const categorySlug = String(formData.get('categorySlug') ?? '');
  const price = Number(formData.get('price'));
  const imagePaths = formData.getAll('imagePath').map(String);
  if (!name || !categorySlug || !Number.isFinite(price) || price < 0) return { error: 'Ürün adı, kategori ve geçerli fiyat zorunludur.' };
  const { data: category } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
  if (!category) return { error: 'Kategori bulunamadı.' };
  const { data: product, error } = await supabase.from('products').insert({ name, slug: `${slugify(name)}-${Date.now()}`, brand, description, price, category_id: category.id, is_featured: formData.get('featured') === 'true' }).select('id').single();
  if (error || !product) return { error: error?.message ?? 'Ürün oluşturulamadı.' };
  if (imagePaths.length) await supabase.from('product_images').insert(imagePaths.map((storage_path, sort_order) => ({ product_id: product.id, storage_path, sort_order })));
  revalidatePath('/'); revalidatePath('/products'); revalidatePath('/admin/products');
  return { error: '' };
}

export async function deleteProduct(productId: string): Promise<ProductState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) return { error: error.message };
  revalidatePath('/'); revalidatePath('/products'); revalidatePath('/admin/products');
  return { error: '' };
}

export async function updateProduct(productId: string, formData: FormData): Promise<ProductState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('products').update({ name: String(formData.get('name') ?? '').trim(), brand: String(formData.get('brand') ?? '').trim(), description: String(formData.get('description') ?? '').trim(), price: Number(formData.get('price')), updated_at: new Date().toISOString() }).eq('id', productId);
  if (error) return { error: error.message };
  const imagePaths = formData.getAll('imagePath').map(String);
  if (imagePaths.length) {
    const { data: last } = await supabase.from('product_images').select('sort_order').eq('product_id', productId).order('sort_order', { ascending: false }).limit(1).maybeSingle();
    await supabase.from('product_images').insert(imagePaths.map((storage_path, index) => ({ product_id: productId, storage_path, sort_order: (last?.sort_order ?? -1) + index + 1 })));
  }
  revalidatePath('/'); revalidatePath('/products'); revalidatePath('/admin/products');
  return { error: '' };
}