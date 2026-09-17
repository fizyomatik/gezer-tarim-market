"use client";

import Link from "next/link";
import Image from 'next/image';
import { Search, User, ShoppingBag, Menu, X, CircleHelp, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import { cartCount } from "../lib/cart";
import { useCart } from "./CartProvider";
import { handleLogout } from "../app/actions";

export default function Navbar({ isAdmin = false, userName, userEmail }: { isAdmin?: boolean; userName?: string; userEmail?: string }) {
  const { items } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
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

          {isAdmin && <Link href="/admin" className="rounded-lg bg-[#174d32] px-4 py-2 text-xs font-bold text-white hover:bg-[#123d27]">Admin Paneli</Link>}

          <button
            onClick={() => setSearchOpen((open) => !open)}
            title="Ürün ara"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50"
            aria-label="Ara"
          >
            <Search size={18} />
          </button>

          {userEmail ? <div className="relative"><button onClick={() => setAccountOpen((open) => !open)} title={`${userName}${userEmail ? ` (${userEmail})` : ""}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50" aria-label="Hesap menüsünü aç" aria-expanded={accountOpen}><User size={18} /></button>{accountOpen && <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl"><div className="border-b border-gray-100 px-3 py-3"><p className="font-bold text-[#174d32]">{userName}</p><p className="mt-1 truncate text-xs text-gray-500">{userEmail}</p></div><Link href="/account" onClick={() => setAccountOpen(false)} className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"><UserCircle size={17} /> Profilim</Link><Link href="/contact" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"><CircleHelp size={17} /> Yardım ve iletişim</Link>{isAdmin && <Link href="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#174d32] hover:bg-[#f3f7e7]">Admin Paneli</Link>}<form action={handleLogout}><button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={17} /> Çıkış yap</button></form></div>}</div> : <Link href="/login" title="Giriş yap" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50" aria-label="Giriş yap"><User size={18} /></Link>}

          <Link
            href="/cart"
            title="Sepeti görüntüle"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50"
            aria-label="Sepet"
          >
            <ShoppingBag size={18} />
            {items.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a5c63b] px-1 text-[11px] font-black text-[#174d32]">{cartCount(items)}</span>}
          </Link>

        </div>

        {/* Mobile */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 lg:hidden"
          aria-label="Menüyü aç"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>
      {searchOpen && <form action="/products" className="border-t border-gray-100 bg-white px-5 py-3 lg:absolute lg:right-8 lg:top-20 lg:w-96 lg:rounded-b-xl lg:border lg:shadow-lg"><div className="flex items-center gap-2"><Search size={18} className="text-gray-400" /><input autoFocus name="q" placeholder="Ürün, marka veya kategori ara..." className="w-full bg-transparent py-2 text-sm outline-none" /></div></form>}
      {menuOpen && <nav className="border-t border-gray-100 bg-white px-5 py-4 lg:hidden"><div className="flex flex-col gap-4">{userEmail ? <><Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-semibold text-gray-700"><UserCircle size={17} /> Profilim</Link><Link href="/contact" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-semibold text-gray-700"><CircleHelp size={17} /> Yardım ve iletişim</Link><form action={handleLogout}><button type="submit" className="flex items-center gap-2 font-semibold text-red-600"><LogOut size={17} /> Çıkış yap</button></form></> : <Link href="/login" onClick={() => setMenuOpen(false)} className="font-semibold text-[#174d32]">Giriş yap</Link>}{isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="font-bold text-[#174d32]">Admin Paneli</Link>}<Link href="/products" onClick={() => setMenuOpen(false)} className="font-semibold text-gray-700">Ürünler</Link><Link href="/service" onClick={() => setMenuOpen(false)} className="font-semibold text-gray-700">Servis & Tamir</Link><Link href="/about" onClick={() => setMenuOpen(false)} className="font-semibold text-gray-700">Hakkımızda</Link><Link href="/contact" onClick={() => setMenuOpen(false)} className="font-semibold text-gray-700">İletişim</Link><Link href="/cart" onClick={() => setMenuOpen(false)} className="font-semibold text-[#174d32]">Sepetim ({cartCount(items)})</Link></div></nav>}
    </header>
  );
}
