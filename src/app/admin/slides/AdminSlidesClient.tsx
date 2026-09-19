'use client';
import AdminContentEditor from '../../../components/AdminContentEditor';
import type { AdminSlide } from '../../../lib/catalog';
import { saveSlide, deleteSlide } from './actions';
export default function AdminSlidesClient({ initialSlides }: { initialSlides: AdminSlide[] }) {
  return <AdminContentEditor kind="slide" items={initialSlides.map((slide) => ({ ...slide, name: slide.title, description: slide.text }))} save={saveSlide} remove={deleteSlide} />;
}
