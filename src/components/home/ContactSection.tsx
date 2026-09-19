import Link from 'next/link';
import { ArrowUpRight, MapPin, Phone } from 'lucide-react';
import { getCompanySettings } from '../../lib/settings';
export default async function ContactSection() {
  const settings = await getCompanySettings();
  return <section className="border-t border-gray-200 bg-[#f7f8f4] py-16"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between lg:px-8"><div><span className="text-sm font-bold tracking-[0.2em] text-[#a5c63b]">BİZE ULAŞIN</span><h2 className="mt-3 text-3xl font-black text-[#174d32]">Sorunuz mu var? Konuşalım.</h2><div className="mt-5 flex flex-col gap-3 text-gray-600 sm:flex-row sm:gap-6"><a href={settings.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2"><MapPin size={17} />{settings.address}</a><a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2"><Phone size={17} />{settings.phone}</a></div></div><Link href="/contact" className="inline-flex items-center gap-2 font-bold text-[#174d32]">İletişim bilgileri <ArrowUpRight size={18} /></Link></div></section>;
}
