'use client';

import Link from 'next/link';
import { formatPrice } from '../../data/products';
import { useCart } from '../../components/CartProvider';
import WhatsAppLink from '../../components/WhatsAppLink';
import { cartTotal, cartMessage } from '../../lib/cart';

export default function CartPage() {
  const { items, addItem, decreaseItem, removeItem, clearCart } = useCart();
  return <main className="min-h-[60vh] bg-[#f7f8f4] py-16"><div className="mx-auto max-w-4xl px-5">
    <h1 className="text-4xl font-black text-[#174d32]">Sepetim</h1>
    {!items.length ? <div className="mt-10 rounded-2xl bg-white p-12 text-center"><p>Sepetinizde henüz ürün yok.</p><Link href="/products" className="mt-5 inline-block underline">Ürünlere göz at</Link></div> : <>
      <button onClick={clearCart} className="mt-4 text-red-700">Sepeti temizle</button>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">{items.map((item) => <div key={item.id} className="rounded-xl bg-white p-4">
          <p className="font-bold">{item.name}</p><p>{formatPrice(item.price)} / adet</p>
          <div className="my-3 flex items-center gap-4">
            <button aria-label={`${item.name} miktarını azalt`} onClick={() => decreaseItem(item.id)} className="rounded border px-3 py-1">−</button>
            <span aria-live="polite">{item.quantity} adet</span>
            <button aria-label={`${item.name} miktarını artır`} onClick={() => addItem(item)} disabled={item.quantity >= 999} className="rounded border px-3 py-1">+</button>
            <button onClick={() => removeItem(item.id)} aria-label={`${item.name} sil`} className="text-red-700">Sil</button>
          </div><p>{formatPrice(cartTotal([item]))}</p>
        </div>)}</div>
        <aside className="h-fit rounded-2xl bg-[#174d32] p-6 text-white"><p>Tahmini toplam</p><p className="mt-2 text-3xl font-black">{formatPrice(cartTotal(items))}</p>
          <p className="mt-4">Fiyat ve stok durumu iletişim sırasında teyit edilir.</p>
          <WhatsAppLink message={cartMessage(items)} className="mt-6 inline-block rounded-lg bg-[#a5c63b] px-4 py-3 font-bold text-[#174d32]">WhatsApp&apos;tan sor</WhatsAppLink>
        </aside>
      </div>
    </>}
  </div></main>;
}
