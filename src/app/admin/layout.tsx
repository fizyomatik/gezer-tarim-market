import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Settings } from 'lucide-react';
import { handleLogout } from '../actions';
import { requireAdmin } from '../../lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* Sidebar Header */}
        <div className="flex h-20 items-center px-6 border-b border-gray-100">
          <Link href="/admin" className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tight text-[#174d32]">GEZER</span>
            <span className="mt-1 text-[8px] font-bold tracking-[0.25em] text-gray-500">YÖNETİM PANELİ</span>
          </Link>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#174d32] transition">
            <LayoutDashboard size={18} /> Panel Özet
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#174d32] transition">
            <Package size={18} /> Ürün Yönetimi
          </Link>
          <Link href="/admin/slides" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#174d32] transition">
            <Package size={18} /> Slayt Yönetimi
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#174d32] transition">
            <ShoppingCart size={18} /> Siparişler
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#174d32] transition">
            <Users size={18} /> Kullanıcılar
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#174d32] transition">
            <Settings size={18} /> Firma Ayarları
          </Link>
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="border-t border-gray-100 p-4">
          {/* 2. ERSETZT: Button in ein Formular mit Server Action gebunden */}
          <form action={handleLogout}>
            <button 
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut size={18} /> Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 w-full flex flex-col">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
          <h1 className="text-lg font-bold text-gray-800">Hoş geldiniz, Admin 👋</h1>
          <Link href="/" className="text-xs font-semibold text-[#174d32] hover:underline">
            Mağazaya Git →
          </Link>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
