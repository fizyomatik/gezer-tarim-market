import ProductsCatalog from "../../components/products/ProductsCatalog";
import { getProducts } from "../../lib/catalog";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
	const params = await searchParams;
	const products = await getProducts();
	return <ProductsCatalog key={`${params.q ?? ""}:${params.category ?? ""}`} products={products} initialQuery={params.q ?? ""} category={params.category ?? ""} />;
}
