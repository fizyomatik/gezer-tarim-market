import { products as fallbackProducts, type Product } from '../data/products';
import { createSupabaseServerClient } from './supabase/server';

export type Slide = {
  id: string;
  title: string;
  text: string;
  image: string;
  href: string;
  sortOrder: number;
};

const fallbackSlides: Slide[] = [
  { id: 'fallback-machines', title: 'Tarlanıza güç katacak makineler', text: 'Budama, biçme ve bakım işlerinizi kolaylaştıran güvenilir tarım aletlerini keşfedin.', image: '/categories/tarim-aletleri.jpeg', href: '/products?category=tarim-aletleri', sortOrder: 1 },
  { id: 'fallback-seed', title: 'Verimli bir sezon doğru ürünle başlar', text: 'Tohumdan gübreye, bitkinizin ihtiyacına uygun ürünleri uzman desteğiyle seçin.', image: '/categories/tohum.jpg', href: '/products', sortOrder: 2 },
  { id: 'fallback-service', title: 'Makineniz için uzman servis', text: 'Tarım makinelerinizin bakım ve onarımı için deneyimli ekibimiz yanınızda.', image: '/categories/peyzaj.jpg', href: '/service', sortOrder: 3 },
];

function publicStorageUrl(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('products').select('id, slug, name, brand, description, price, is_featured, categories(name, slug), product_images(storage_path, sort_order)').eq('is_active', true).order('created_at', { ascending: false });
    if (error || !data?.length) return fallbackProducts;

    return data.map((product) => {
      const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
      const images = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order).map((image) => publicStorageUrl(supabase, 'product-images', image.storage_path));
      return { id: product.id, slug: product.slug, name: product.name, category: category?.name ?? '', categorySlug: category?.slug ?? '', brand: product.brand, description: product.description, price: Number(product.price), image: images[0] ?? '/images/logo.jpeg', images, featured: product.is_featured };
    });
  } catch {
    return fallbackProducts;
  }
}

export async function getFeaturedProducts() {
  return (await getProducts()).filter((product) => product.featured);
}

export async function getProductBySlug(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug);
}

export async function getActiveSlides(): Promise<Slide[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('slides').select('id, title, text, href, image_path, sort_order').eq('is_active', true).order('sort_order', { ascending: true });
    if (error || !data?.length) return fallbackSlides;
    return data.map((slide) => ({ id: slide.id, title: slide.title, text: slide.text, href: slide.href, image: publicStorageUrl(supabase, 'site-media', slide.image_path), sortOrder: slide.sort_order }));
  } catch {
    return fallbackSlides;
  }
}

export async function getSlidesForAdmin(): Promise<(Slide & { isActive: boolean })[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('slides').select('id, title, text, href, image_path, is_active, sort_order').order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data.map((slide) => ({ id: slide.id, title: slide.title, text: slide.text, href: slide.href, image: publicStorageUrl(supabase, 'site-media', slide.image_path), sortOrder: slide.sort_order, isActive: slide.is_active }));
}