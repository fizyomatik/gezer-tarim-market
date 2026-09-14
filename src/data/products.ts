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
  featured?: boolean;
};

export const products: Product[] = [
  { id: "budama-makasi", slug: "akulu-budama-makasi", name: "Akülü Budama Makası", category: "Tarım Aletleri", categorySlug: "tarim-aletleri", brand: "Gezer Pro", description: "Bağ, bahçe ve meyve ağaçları için güçlü ve pratik budama makası.", price: 4250, image: "/categories/tarim-aletleri.jpeg", featured: true },
  { id: "motorlu-tirpan", slug: "motorlu-tirpan", name: "Motorlu Tırpan", category: "Tarım Aletleri", categorySlug: "tarim-aletleri", brand: "Gezer Power", description: "Yoğun ot ve yabancı ot temizliği için dayanıklı motorlu tırpan.", price: 8950, image: "/categories/tarim-aletleri.jpeg", featured: true },
  { id: "profesyonel-gubre", slug: "profesyonel-taban-gubresi", name: "Profesyonel Taban Gübresi", category: "Gübre", categorySlug: "gubre", brand: "Tarım Plus", description: "Dengeli besleme için farklı bitki ve toprak ihtiyaçlarına uygun gübre.", price: 780, image: "/categories/gubre.jpeg", featured: true },
  { id: "domates-tohumu", slug: "verimli-domates-tohumu", name: "Verimli Domates Tohumu", category: "Tohum", categorySlug: "tohum", brand: "Gezer Tohum", description: "Sebze bahçeleri için seçilmiş, yüksek verimli domates tohumu.", price: 145, image: "/categories/tohum.jpg", featured: true },
  { id: "bitki-koruma", slug: "bitki-koruma-urunleri", name: "Bitki Koruma Ürünleri", category: "Zirai İlaç", categorySlug: "zirai-ilac", brand: "Agro Güven", description: "Bitkilerinizin sağlıklı gelişimi için uzman desteğiyle doğru çözümler.", price: 560, image: "/categories/zirai-ilac.jpg" },
  { id: "bahce-sulama", slug: "bahce-sulama-seti", name: "Bahçe Sulama Seti", category: "Peyzaj", categorySlug: "peyzaj", brand: "Bahçe Yaşam", description: "Bahçeniz ve peyzaj alanlarınız için kolay kurulan sulama seti.", price: 990, image: "/categories/peyzaj.jpg" },
];

export const formatPrice = (price: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price);
