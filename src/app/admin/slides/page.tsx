import { getSlidesForAdmin } from '../../../lib/catalog';
import AdminSlidesClient from './AdminSlidesClient';

export default async function AdminSlidesPage() {
  return <AdminSlidesClient initialSlides={await getSlidesForAdmin()} />;
}