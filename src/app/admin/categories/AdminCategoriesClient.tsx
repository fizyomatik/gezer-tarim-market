'use client';
import AdminContentEditor from '../../../components/AdminContentEditor';
import type { Category } from '../../../lib/catalog';
import { saveCategory, deleteCategory } from './actions';
export default function AdminCategoriesClient({ categories }: { categories: Category[] }) {
  return <AdminContentEditor kind="category" items={categories} save={saveCategory} remove={deleteCategory} />;
}
