import Link from "next/link";
import Image from 'next/image';
import { Search, User, ShoppingBag, Menu } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

        {/* Logo & Company Name */}
        <Link href="/" className="flex items-center gap-3">
          {/* Bild-Container */}
          <div className="relative h-20 w-18 shrink-0">
            <Image
              src="/images/logo.jpeg"
              alt="Gezer Tarım Market Logo"
              fill
              priority
              sizes="56px"
              className="object-contain"
            />
          </div>
          
          {/* Text-Container */}
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tight text-[#174d32]">
              GEZER
            </span>
            <span className="mt-1 text-[9px] font-bold tracking-[0.25em] text-gray-500">
              TARIM MARKET
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">

          <Link
            href="/"
            className="text-sm font-semibold text-gray-700 transition hover:text-[#174d32]"
          >
            Ana Sayfa
          </Link>

          <Link
            href="/products"
            className="text-sm font-semibold text-gray-700 transition hover:text-[#174d32]"
          >
            Ürünler
          </Link>

          <Link
            href="/products?category=tohum"
            className="text-sm font-semibold text-gray-700 transition hover:text-[#174d32]"
          >
            Tohum
          </Link>

          <Link
            href="/products?category=gubre"
            className="text-sm font-semibold text-gray-700 transition hover:text-[#174d32]"
          >
            Gübre
          </Link>

          <Link
            href="/products?category=zirai-ilac"
            className="text-sm font-semibold text-gray-700 transition hover:text-[#174d32]"
          >
            Zirai İlaç
          </Link>

          <Link
            href="/products?category=tarim-aletleri"
            className="text-sm font-semibold text-gray-700 transition hover:text-[#174d32]"
          >
            Tarım Aletleri
          </Link>

          <Link
            href="/service"
            className="text-sm font-semibold text-gray-700 transition hover:text-[#174d32]"
          >
            Servis & Tamir
          </Link>

        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2 lg:flex">

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50"
            aria-label="Ara"
          >
            <Search size={18} />
          </button>

          <Link
            href="/login"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50"
            aria-label="Hesabım"
          >
            <User size={18} />
          </Link>

          <Link
            href="/cart"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50"
            aria-label="Sepet"
          >
            <ShoppingBag size={18} />
          </Link>

        </div>

        {/* Mobile */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 lg:hidden"
          aria-label="Menüyü aç"
        >
          <Menu size={20} />
        </button>

      </div>
    </header>
  );
}
