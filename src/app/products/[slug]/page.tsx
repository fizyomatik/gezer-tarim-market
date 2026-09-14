import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { products, formatPrice } from "../../../data/products";
import ProductComments from "../../../components/products/ProductComments";
import WhatsAppLink from "../../../components/WhatsAppLink";

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const product = products.find((item) => item.slug === slug);
	if (!product) return <main className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="text-3xl font-black text-[#174d32]">Ürün bulunamadı</h1><Link href="/products" className="mt-5 inline-block font-bold text-[#174d32]">Ürünlere dön</Link></main>;
	return <main className="bg-[#f7f8f4] py-16"><div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:px-8"><div className="overflow-hidden rounded-3xl bg-white"><Image src={product.image} alt={product.name} width={900} height={680} className="h-full min-h-[360px] w-full object-cover" /></div><div className="self-center"><p className="text-sm font-bold uppercase tracking-[0.15em] text-[#a5c63b]">{product.category}</p><h1 className="mt-4 text-4xl font-black text-[#174d32]">{product.name}</h1><p className="mt-3 text-gray-500">{product.brand}</p><p className="mt-8 leading-8 text-gray-600">{product.description}</p><p className="mt-8 text-3xl font-black text-gray-900">{formatPrice(product.price)}</p><WhatsAppLink title="WhatsApp ile bilgi al" message={`Merhaba, ${product.name} hakkında bilgi almak istiyorum.`} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#174d32] px-6 py-3 font-bold text-white hover:bg-[#123d27]"><MessageCircle size={18} /> WhatsApp&apos;tan bilgi al</WhatsAppLink></div></div><ProductComments productId={product.id} /></main>;
}
