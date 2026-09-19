'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../lib/supabase/server';

export interface AuthState { error: string }
export async function handleLogin(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'E-posta ve şifre zorunludur.' };
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { error: 'E-posta adresi veya şifre hatalı.' };
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profileError || profile?.role !== 'admin') {
      await supabase.auth.signOut();
      return { error: 'Bu giriş yalnızca yöneticiler içindir.' };
    }
  } catch { return { error: 'Giriş yapılamadı. Lütfen tekrar deneyin.' }; }
  redirect('/admin');
}
export async function handleLogout() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error('Çıkış yapılamadı. Lütfen tekrar deneyin.');
  redirect('/login');
}
