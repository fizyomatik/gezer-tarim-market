import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { getCompanySettings } from '../../lib/settings';
import WhatsAppLink from '../../components/WhatsAppLink';
export default async function ContactPage() {
  const settings = await getCompanySettings();
  const details = [
    { Icon: MapPin, title: 'Adres', text: settings.address, href: settings.mapUrl },
    { Icon: Phone, title: 'Telefon', text: settings.phone, href: `tel:${settings.phone.replace(/[^+\d]/g, '')}` },
    { Icon: Mail, title: 'E-posta', text: settings.email, href: `mailto:${settings.email}` },
    { Icon: Clock3, title: 'Çalışma saatleri', text: settings.hours, href: null },
  ];
  return <main className="bg-[#f7f8f4] py-20"><div className="mx-auto max-w-6xl px-5 lg:px-8"><span className="text-sm font-bold tracking-[0.2em] text-[#a5c63b]">İLETİŞİM</span><h1 className="mt-4 text-4xl font-black text-[#174d32] md:text-6xl">Size yardımcı olmak için buradayız.</h1><div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{details.map(({ Icon, title, text, href }) => <div key={title} className="rounded-2xl bg-white p-7"><Icon className="text-[#174d32]" size={25} /><h2 className="mt-6 font-black text-gray-900">{title}</h2><p className="mt-2 break-words text-sm leading-6 text-gray-600">{href ? <a href={href}>{text}</a> : text}</p></div>)}</div><a href={settings.mapUrl} target="_blank" rel="noreferrer" className="mt-6 inline-block font-bold text-[#174d32] underline">Haritada aç →</a><div className="mt-8 rounded-2xl bg-[#174d32] p-8 text-white"><h2 className="text-2xl font-black">WhatsApp&apos;tan hızlıca yazın</h2><p className="mt-2 text-white/70">Ürün, servis veya mağazamız hakkında sorularınızı yanıtlayalım.</p><WhatsAppLink message="Merhaba, bilgi almak istiyorum." className="mt-6 inline-block rounded-lg bg-[#a5c63b] px-6 py-3 font-bold text-[#174d32]">WhatsApp&apos;a geç</WhatsAppLink></div></div></main>;
}
