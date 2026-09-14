'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/auth';

type SlideState = { error: string };

export async function createSlide(formData: FormData): Promise<SlideState> {
  const { supabase } = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  const text = String(formData.get('text') ?? '').trim();
  const href = String(formData.get('href') ?? '/products').trim();
  const imagePath = String(formData.get('imagePath') ?? '');
  if (!title || !imagePath) return { error: 'Başlık ve görsel zorunludur.' };
  const { data: last } = await supabase.from('slides').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from('slides').insert({ title, text, href, image_path: imagePath, sort_order: (last?.sort_order ?? 0) + 1 });
  if (error) return { error: error.message };
  revalidatePath('/'); revalidatePath('/admin/slides');
  return { error: '' };
}

export async function toggleSlide(id: string, isActive: boolean): Promise<SlideState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('slides').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/'); revalidatePath('/admin/slides');
  return { error: '' };
}

export async function deleteSlide(id: string): Promise<SlideState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('slides').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/'); revalidatePath('/admin/slides');
  return { error: '' };
}