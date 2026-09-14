import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { products } from "../../data/products";
import ProductCard from "../products/ProductCard";

export default function FeaturedProducts() {
	return <section className="bg-[#f7f8f4] py-20"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-10 flex items-end justify-between gap-4"><div><span className="text-sm font-bold tracking-[0.2em] text-[#a5c63b]">ÖNE ÇIKANLAR</span><h2 className="mt-3 text-3xl font-black text-[#174d32] md:text-4xl">Sezonun favorileri</h2></div><Link href="/products" className="hidden items-center gap-2 font-bold text-[#174d32] sm:flex">Tüm ürünler <ArrowUpRight size={18} /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.filter((product) => product.featured).map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>;
}
