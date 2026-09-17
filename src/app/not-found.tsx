import Link from 'next/link';
export default function NotFound() {
  return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-2xl font-bold">Sayfa bulunamadı</h1>
    <Link className="mt-5 block underline" href="/products">Ürünlere dön</Link></main>;
}
