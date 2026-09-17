import type { Product } from '../data/products';
import { createSupabaseServerClient } from './supabase/server';
import { requireAdmin } from './auth';

export type Slide = { id: string; title: string; text: string; image: string; href: string; sortOrder: number };
export type Category = { name: string; slug: string };
const productSelect = 'id, slug, name, brand, description, price, is_featured, is_active, categories(name, slug), product_images(storage_path, sort_order)';

function productQuery(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  return supabase.from('products').select(productSelect).order('created_at', { ascending: false }).order('id');
}
type ProductRows = NonNullable<Awaited<ReturnType<typeof productQuery>>['data']>;
function mapProducts(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, rows: ProductRows): Product[] {
  return rows.map((product) => {
    const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
    const images = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => supabase.storage.from('product-images').getPublicUrl(image.storage_path).data.publicUrl);
    return { id: product.id, slug: product.slug, name: product.name, category: category?.name ?? '', categorySlug: category?.slug ?? '',
      brand: product.brand, description: product.description, price: Number(product.price), image: images[0] ?? '/images/logo.jpeg',
      images, featured: product.is_featured, active: product.is_active };
  });
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await productQuery(supabase).eq('is_active', true);
  if (error) throw new Error('Ürünler yüklenemedi.');
  return mapProducts(supabase, data ?? []);
}

export async function getProductsForAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await productQuery(supabase);
  if (error) throw new Error('Ürünler yüklenemedi.');
  return mapProducts(supabase, data ?? []);
}

export async function getCategoriesForAdmin(): Promise<Category[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from('categories').select('name,slug').order('sort_order');
  if (error) throw new Error('Kategoriler yüklenemedi.');
  return data ?? [];
}

export async function getFeaturedProducts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await productQuery(supabase).eq('is_active', true).eq('is_featured', true).limit(8);
  if (error) throw new Error('Öne çıkan ürünler yüklenemedi.');
  return mapProducts(supabase, data ?? []);
}

export async function getProductBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await productQuery(supabase).eq('is_active', true).eq('slug', slug).maybeSingle();
  if (error) throw new Error('Ürün yüklenemedi.');
  return data ? mapProducts(supabase, [data])[0] : undefined;
}

export async function getActiveSlides(): Promise<Slide[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('slides').select('id,title,text,href,image_path,sort_order')
    .eq('is_active', true).order('sort_order').order('created_at');
  if (error) throw new Error('Slaytlar yüklenemedi.');
  return (data ?? []).map((slide) => ({ id: slide.id, title: slide.title, text: slide.text, href: slide.href,
    image: supabase.storage.from('site-media').getPublicUrl(slide.image_path).data.publicUrl, sortOrder: slide.sort_order }));
}

export async function getSlidesForAdmin(): Promise<(Slide & { isActive: boolean })[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from('slides').select('id,title,text,href,image_path,is_active,sort_order').order('sort_order').order('created_at');
  if (error) throw new Error('Slaytlar yüklenemedi.');
  return (data ?? []).map((slide) => ({ id: slide.id, title: slide.title, text: slide.text, href: slide.href,
    image: supabase.storage.from('site-media').getPublicUrl(slide.image_path).data.publicUrl, sortOrder: slide.sort_order, isActive: slide.is_active }));
}
