'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { cartCount } from '../lib/cart';
import { useCart } from './CartProvider';
import { useCompanySettings } from './CompanySettingsProvider';
import { handleLogout } from '../app/actions';
import type { Category } from '../lib/catalog';

export default function Navbar({ isAdmin, userName, userEmail, categories }: { isAdmin: boolean; userName?: string; userEmail?: string; categories: Category[] }) {
  const { items } = useCart();
  const { settings } = useCompanySettings();
  const [open, setOpen] = useState(false);
  const links = [['/', 'Ana Sayfa'], ['/products', 'Ürünler'], ['/service', 'Servis & Tamir'], ['/about', 'Hakkımızda'], ['/contact', 'İletişim']];
  return <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
    <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-2 lg:px-8">
      <Link href="/" className="flex items-center gap-3"><Image src="/images/logo.jpeg" alt="" width={56} height={64} priority className="h-16 w-14 object-contain" /><span className="max-w-44 text-lg font-black leading-tight text-[#174d32]">{settings.companyName}</span></Link>
      <nav aria-label="Ana menü" className="hidden items-center gap-5 lg:flex">
        {links.map(([href, label]) => <Link key={href} href={href} className="text-sm font-semibold text-gray-700 hover:text-[#174d32]">{label}</Link>)}
        {!!categories.length && <details className="relative"><summary className="cursor-pointer text-sm font-semibold">Kategoriler</summary><div className="absolute right-0 mt-3 max-h-80 w-60 overflow-auto rounded-xl border bg-white p-3 shadow-lg">{categories.map((category) => <Link key={category.id} href={`/products?category=${category.slug}`} onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')} className="block rounded px-3 py-2 hover:bg-gray-50">{category.name}</Link>)}</div></details>}
      </nav>
      <div className="flex items-center gap-3"><Link href="/cart" aria-label={`Bilgi talep listesi, ${cartCount(items)} ürün`} className="flex items-center gap-1 text-[#174d32]"><ShoppingBag size={21} /><span>{cartCount(items)}</span></Link>
        {isAdmin ? <Link href="/admin" title={userName || userEmail} className="hidden rounded-lg bg-[#174d32] px-3 py-2 text-sm font-bold text-white sm:block">Yönetim</Link> : <Link href="/login" className="hidden text-xs text-gray-500 sm:block">Yönetici girişi</Link>}
        <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'} className="rounded border p-2 lg:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
    <form action="/products" className="mx-auto flex max-w-7xl items-center gap-2 px-5 pb-3 lg:px-8"><Search size={17} className="text-gray-400" /><input type="search" name="q" aria-label="Ürün ara" placeholder="Ürün, marka veya kategori ara…" className="min-w-0 flex-1 rounded border border-gray-200 px-3 py-2 text-sm" /><button className="rounded bg-[#174d32] px-4 py-2 text-sm font-bold text-white">Ara</button></form>
    {open && <nav id="mobile-menu" aria-label="Mobil menü" className="max-h-[60vh] overflow-auto border-t px-5 py-4 lg:hidden"><div className="flex flex-col gap-4">
      {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
      {!!categories.length && <details><summary>Kategoriler</summary><div className="grid gap-3 py-3 pl-4">{categories.map((category) => <Link key={category.id} href={`/products?category=${category.slug}`} onClick={() => setOpen(false)}>{category.name}</Link>)}</div></details>}
      <Link href="/cart" onClick={() => setOpen(false)}>Bilgi talep listem ({cartCount(items)})</Link>
      <Link href={isAdmin ? '/admin' : '/login'} onClick={() => setOpen(false)}>{isAdmin ? 'Yönetim paneli' : 'Yönetici girişi'}</Link>
      {isAdmin && <form action={handleLogout}><button className="text-red-700">Çıkış yap</button></form>}
    </div></nav>}
  </header>;
}
