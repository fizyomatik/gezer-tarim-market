export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  brand: string;
  description: string;
  price: number | null;
  image: string;
  images?: string[];
  imagePaths?: string[];
  featured?: boolean;
  active?: boolean;
};

export const formatPrice = (price: number | null) => price === null ? "Fiyat için iletişime geçin" : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);
