export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  brand: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  featured?: boolean;
  active?: boolean;
};

export const formatPrice = (price: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);
