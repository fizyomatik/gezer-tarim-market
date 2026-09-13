import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#174d32]">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-5 py-20 lg:px-8">
        <div className="max-w-3xl">

          <span className="text-sm font-bold tracking-[0.2em] text-[#a5c63b]">
            GEZER TARIM MARKET
          </span>

          <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">
            Tarımın her alanında
            <br />
            yanınızdayız.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
            Tohum, gübre, zirai ilaç, tarım aletleri,
            peyzaj ürünleri ve profesyonel servis hizmetleri.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">

            <Link
              href="/products"
              className="rounded-lg bg-[#a5c63b] px-7 py-4 font-bold text-[#174d32] transition hover:bg-white"
            >
              Ürünleri Keşfet
            </Link>

            <Link
              href="/service"
              className="rounded-lg border border-white/30 px-7 py-4 font-bold text-white transition hover:bg-white hover:text-[#174d32]"
            >
              Servis & Tamir
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}