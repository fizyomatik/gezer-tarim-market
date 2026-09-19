import ProductsCatalog from '../../components/products/ProductsCatalog';
import { getProducts, getCategories } from '../../lib/catalog';
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; category?: string | string[] }> }) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <ProductsCatalog products={products} categories={categories} initialQuery={typeof params.q === 'string' ? params.q : ''} category={typeof params.category === 'string' ? params.category : ''} />;
}
