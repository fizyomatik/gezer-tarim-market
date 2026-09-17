import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Tohum",
    slug: "tohum",
    description: "Kaliteli ve verimli tohum çeşitleri",
    image: "/categories/tohum.jpg",
  },
  {
    name: "Gübre",
    slug: "gubre",
    description: "Bitkinizin ihtiyacına uygun gübreler",
    image: "/categories/gubre.jpeg",
  },
  {
    name: "Zirai İlaç",
    slug: "zirai-ilac",
    description: "Bitki sağlığı ve koruma ürünleri",
    image: "/categories/zirai-ilac.jpg",
  },
  {
    name: "Tarım Aletleri",
    slug: "tarim-aletleri",
    description: "Tarım işleriniz için profesyonel ekipmanlar",
    image: "/categories/tarim-aletleri.jpeg",
  },
  {
    name: "Peyzaj",
    slug: "peyzaj",
    description: "Bahçe ve peyzaj ürünleri",
    image: "/categories/peyzaj.jpg",
  },
];

export default function Categories() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* Başlık */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-bold tracking-[0.2em] text-[#a5c63b]">
              KATEGORİLER
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#174d32] md:text-4xl">
              İhtiyacınız olan her şey
            </h2>
          </div>

          <Link
            href="/products"
            className="font-bold text-[#174d32] transition hover:text-[#a5c63b]"
          >
            Tüm ürünleri gör →
          </Link>
        </div>

        {/* Kategori Kartları */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Görsel */}
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <Image
                  src={category.image}
                  width={640}
                  height={480}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* İçerik */}
              <div className="p-5">
                <h3 className="text-xl font-black text-[#174d32]">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {category.description}
                </p>

                <span className="mt-4 inline-block text-sm font-bold text-[#174d32]">
                  Ürünleri incele →
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}