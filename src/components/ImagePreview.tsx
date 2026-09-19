'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
export default function ImagePreview({ file, src, alt }: { file?: File; src?: string; alt: string }) {
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // The URL only exists in the browser and is released when this file changes.
    const frame = requestAnimationFrame(() => setPreview(url));
    return () => { cancelAnimationFrame(frame); URL.revokeObjectURL(url); };
  }, [file]);
  const source = file ? preview : src;
  return source ? <Image src={source} alt={alt} width={160} height={100} unoptimized={!!file} className="h-24 w-36 rounded-lg object-cover" /> : <span>Önizleme yükleniyor…</span>;
}
