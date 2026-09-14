import ProductsCatalog from "../../components/products/ProductsCatalog";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
	const params = await searchParams;
	return <ProductsCatalog initialQuery={params.q ?? ""} category={params.category ?? ""} />;
}
