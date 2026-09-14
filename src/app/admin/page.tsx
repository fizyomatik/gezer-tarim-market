export default function AdminDashboard() {
  // In a real application, you would fetch these data metrics from your Database
  const stats = [
    { name: 'Toplam Satış', value: '₺145,230', change: '+12%', color: 'text-green-600' },
    { name: 'Aktif Siparişler', value: '38 adet', change: '+5%', color: 'text-blue-600' },
    { name: 'Toplam Ürün', value: '1,240 çeşit', change: '0%', color: 'text-gray-600' },
    { name: 'Yeni Çiftçiler / Üyeler', value: '84 kullanıcı', change: '+18%', color: 'text-[#174d32]' },
  ];

  return (
    <div className="space-y-8">
      {/* Cards Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
            <dd className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-gray-900">{stat.value}</span>
              <span className={`text-xs font-semibold ${stat.color}`}>{stat.change}</span>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity Table Mockup */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Son Gelen Siparişler</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-3.5 font-medium text-gray-900">Mehmet Yılmaz</td>
                <td className="px-4 py-3.5">Zirai İlaç / Gübre</td>
                <td className="px-4 py-3.5">₺4,250.00</td>
                <td className="px-4 py-3.5"><span className="inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Hazırlanıyor</span></td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-3.5 font-medium text-gray-900">Ali Demir</td>
                <td className="px-4 py-3.5">Tarım Aletleri</td>
                <td className="px-4 py-3.5">₺12,800.00</td>
                <td className="px-4 py-3.5"><span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">Kargoda</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
