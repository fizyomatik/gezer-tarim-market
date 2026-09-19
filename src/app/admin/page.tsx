import Link from 'next/link';
import CleanupButton from '../../components/CleanupButton';
import { requireAdmin } from '../../lib/auth';

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();
  const results = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('slides').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('storage_cleanup').select('path', { count: 'exact', head: true }).lte('ready_at', new Date().toISOString()),
  ]);
  if (results.some((result) => result.error)) throw new Error('Panel bilgileri yüklenemedi.');
  const labels = ['Toplam ürün', 'Yayındaki ürün', 'Yayındaki slayt', 'Kategori'];
  return <div className="space-y-8"><h1 className="text-3xl font-bold text-[#174d32]">Panel özeti</h1>
    <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{labels.map((label, index) => <div key={label} className="rounded-xl border bg-white p-6"><dt>{label}</dt><dd className="mt-2 text-3xl font-bold">{results[index].count ?? 0}</dd></div>)}</dl>
    {(results[4].count ?? 0) > 0 && <p role="status">{results[4].count} görsel için temizleme bekleniyor. Temizlemeyi yeniden deneyebilirsiniz.</p>}
    <CleanupButton /><div className="flex flex-wrap gap-5"><Link href="/admin/categories" className="underline">Kategorileri yönet</Link><Link href="/admin/products" className="underline">Ürünleri yönet</Link><Link href="/admin/slides" className="underline">Slaytları yönet</Link><Link href="/admin/settings" className="underline">Firma bilgileri</Link></div>
    <p>Servis talepleri ve ürün soruları WhatsApp üzerinden alınır. Bu site bir ürün kataloğudur; talepler WhatsApp üzerinden değerlendirilir.</p>
  </div>;
}
