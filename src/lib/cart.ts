import type { Product } from '../data/products';
export type CartItem = Product & { quantity: number };
export const cartTotal = (items: CartItem[]) => items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
export const cartCount = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);
export const cartMessage = (items: CartItem[]) => `Merhaba, ${items.map((item) => `${item.name} (${item.quantity} adet)`).join(', ')} ürünleri hakkında bilgi almak istiyorum.`;

export function restoreCart(value: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => item &&
      ['id', 'slug', 'name', 'category', 'categorySlug', 'brand', 'description', 'image'].every((key) => typeof item[key] === 'string') &&
      typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 &&
      (item.quantity === undefined || (Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 999)))
      .map((item) => ({ ...item, quantity: item.quantity ?? 1 }));
  } catch { return []; }
}
