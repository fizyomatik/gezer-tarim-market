import { cache } from 'react';
import type { Product } from '../data/products';
import { createSupabaseServerClient } from './supabase/server';
import { requireAdmin } from './auth';

export type Slide = { id: string; title: string; text: string; image: string; href: string; sortOrder: number };
export type AdminSlide = Slide & { imagePath: string; isActive: boolean };
export type Category = { id: string; name: string; slug: string; description: string; image: string; imagePath: string | null; sortOrder: number; isActive: boolean };
const productSelect = 'id, slug, name, brand, description, price, is_featured, is_active, categories!inner(name, slug, is_active), product_images(storage_path, sort_order)';
function productQuery(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  return supabase.from('products').select(productSelect).order('created_at', { ascending: false }).order('id');
}
type ProductRows = NonNullable<Awaited<ReturnType<typeof productQuery>>['data']>;
function mapProducts(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, rows: ProductRows): Product[] {
  return rows.map((product) => {
    const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
    const imagePaths = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order).map((image) => image.storage_path);
    const images = imagePaths.map((path) => supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
    return { id: product.id, slug: product.slug, name: product.name, category: category?.name ?? '', categorySlug: category?.slug ?? '',
      brand: product.brand, description: product.description, price: product.price === null ? null : Number(product.price), image: images[0] ?? '/images/logo.jpeg',
      images, imagePaths, featured: product.is_featured, active: product.is_active };
  });
}
export async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await productQuery(supabase).eq('is_active', true).eq('categories.is_active', true);
  if (error) throw new Error('Ürünler yüklenemedi.');
  return mapProducts(supabase, data ?? []);
}
export async function getProductsForAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await productQuery(supabase);
  if (error) throw new Error('Ürünler yüklenemedi.');
  return mapProducts(supabase, data ?? []);
}
async function categoriesQuery(admin: boolean): Promise<Category[]> {
  const supabase = admin ? (await requireAdmin()).supabase : await createSupabaseServerClient();
  console.log("supabase", supabase)
  let query = supabase.from('categories').select('id,name,slug,description,image_path,sort_order,is_active').order('sort_order').order('id');
  console.log("query", query) 
  if (!admin) query = query.eq('is_active', true);
  console.log("query after", query)
  const { data, error } = await query;
  console.log("categoriesQuery", data, error)

  if (error) throw new Error('Kategoriler yüklenemedi.');
  return (data ?? []).map((category) => ({ id: category.id, name: category.name, slug: category.slug, description: category.description,
    image: category.image_path ? supabase.storage.from('site-media').getPublicUrl(category.image_path).data.publicUrl : '/images/logo.jpeg',
    imagePath: category.image_path, sortOrder: category.sort_order, isActive: category.is_active }));
}
export const getCategories = cache(() => categoriesQuery(false));
export const getCategoriesForAdmin = () => categoriesQuery(true);
export async function getFeaturedProducts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await productQuery(supabase).eq('is_active', true).eq('categories.is_active', true).eq('is_featured', true).limit(8);
  if (error) throw new Error('Öne çıkan ürünler yüklenemedi.');
  return mapProducts(supabase, data ?? []);
}
export async function getProductBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await productQuery(supabase).eq('is_active', true).eq('categories.is_active', true).eq('slug', slug).maybeSingle();
  if (error) throw new Error('Ürün yüklenemedi.');
  return data ? mapProducts(supabase, [data])[0] : undefined;
}
export async function getActiveSlides(): Promise<Slide[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('slides').select('id,title,text,href,image_path,sort_order')
    .eq('is_active', true).order('sort_order').order('id');
  if (error) throw new Error('Slaytlar yüklenemedi.');
  return (data ?? []).map((slide) => ({ id: slide.id, title: slide.title, text: slide.text, href: slide.href,
    image: supabase.storage.from('site-media').getPublicUrl(slide.image_path).data.publicUrl, sortOrder: slide.sort_order }));
}
export async function getSlidesForAdmin(): Promise<AdminSlide[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from('slides').select('id,title,text,href,image_path,is_active,sort_order').order('sort_order').order('id');
  if (error) throw new Error('Slaytlar yüklenemedi.');
  return (data ?? []).map((slide) => ({ id: slide.id, title: slide.title, text: slide.text, href: slide.href,
    image: supabase.storage.from('site-media').getPublicUrl(slide.image_path).data.publicUrl, imagePath: slide.image_path,
    sortOrder: slide.sort_order, isActive: slide.is_active }));
}
