'use client';
import Image from 'next/image';
import { useState } from 'react';
export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const available = images.length ? images : ['/images/logo.jpeg'];
  return <div className="space-y-4"><div className="overflow-hidden rounded-3xl bg-white"><Image src={available[selected] ?? available[0]} alt={name} width={900} height={680} priority className="aspect-[4/3] w-full object-contain" /></div>
    {available.length > 1 && <div className="flex flex-wrap gap-3" aria-label="Ürün görselleri">{available.map((image, index) => <button key={`${image}:${index}`} onClick={() => setSelected(index)} aria-label={`${index + 1}. görseli göster`} aria-pressed={selected === index} className={`overflow-hidden rounded-lg border-2 ${selected === index ? 'border-[#174d32]' : 'border-transparent'}`}><Image src={image} alt="" width={90} height={70} className="h-18 w-24 object-cover" /></button>)}</div>}
  </div>;
}
