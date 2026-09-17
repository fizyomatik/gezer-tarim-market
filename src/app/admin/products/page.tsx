import { getCategoriesForAdmin, getProductsForAdmin } from '../../../lib/catalog';
import AdminProductsClient from './AdminProductsClient';

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProductsForAdmin(), getCategoriesForAdmin()]);
  return <AdminProductsClient initialProducts={products} categories={categories} />;
}
