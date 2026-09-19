import { getCategoriesForAdmin } from '../../../lib/catalog';
import AdminCategoriesClient from './AdminCategoriesClient';
export default async function Page() { return <AdminCategoriesClient categories={await getCategoriesForAdmin()} />; }
