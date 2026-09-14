"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  { title: "Tarlanıza güç katacak makineler", text: "Budama, biçme ve bakım işlerinizi kolaylaştıran güvenilir tarım aletlerini keşfedin.", image: "/categories/tarim-aletleri.jpeg", href: "/products?category=tarim-aletleri" },
  { title: "Verimli bir sezon doğru ürünle başlar", text: "Tohumdan gübreye, bitkinizin ihtiyacına uygun ürünleri uzman desteğiyle seçin.", image: "/categories/tohum.jpg", href: "/products" },
  { title: "Makineniz için uzman servis", text: "Tarım makinelerinizin bakım ve onarımı için deneyimli ekibimiz yanınızda.", image: "/categories/peyzaj.jpg", href: "/service" },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000); return () => window.clearInterval(timer); }, []);
  const slide = slides[active];
  return (
    <section className="relative overflow-hidden bg-[#174d32]">
      <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="relative z-10 max-w-3xl">

          <span className="text-sm font-bold tracking-[0.2em] text-[#a5c63b]">
            GEZER TARIM MARKET
          </span>

          <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">
            {slide.title}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
            {slide.text}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">

            <Link
              href={slide.href}
              className="rounded-lg bg-[#a5c63b] px-7 py-4 font-bold text-[#174d32] transition hover:bg-white"
            >
              {slide.href === "/service" ? "Servis talebi oluştur" : "Ürünleri keşfet"}
            </Link>

            <Link
              href="/service"
              className="rounded-lg border border-white/30 px-7 py-4 font-bold text-white transition hover:bg-white hover:text-[#174d32]"
            >
              <Wrench size={18} /> Servis & Tamir
            </Link>

          </div>

        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-3xl border border-white/20 lg:block"><Image key={slide.image} src={slide.image} alt={slide.title} fill className="object-cover" priority={active === 0} /><div className="absolute inset-0 bg-gradient-to-t from-[#174d32]/70 to-transparent" /><div className="absolute bottom-6 left-6 text-sm font-bold text-white">Gezer Tarım Market</div></div>
      </div>
      <div className="absolute bottom-8 left-5 z-10 flex items-center gap-3 lg:left-1/2"><button onClick={() => setActive((active - 1 + slides.length) % slides.length)} aria-label="Önceki slayt" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"><ArrowLeft size={17} /></button><div className="flex gap-2">{slides.map((item, index) => <button key={item.title} onClick={() => setActive(index)} aria-label={`${index + 1}. slayt`} className={`h-2 rounded-full transition-all ${active === index ? "w-8 bg-[#a5c63b]" : "w-2 bg-white/40"}`} />)}</div><button onClick={() => setActive((active + 1) % slides.length)} aria-label="Sonraki slayt" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"><ArrowRight size={17} /></button></div>
    </section>
  );
}