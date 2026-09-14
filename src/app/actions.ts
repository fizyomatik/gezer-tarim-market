'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '../lib/supabase/server'

export interface AuthState {
  error: string
}

export async function handleLogin(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'E-posta ve şifre zorunludur.' }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: 'E-posta adresi veya şifre hatalı.' }
  } catch {
    return { error: 'Sistemde bir hata oluştu, lütfen tekrar deneyin.' }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null }
  redirect(profile?.role === 'admin' ? '/admin' : '/')
}

export async function handleRegister(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || password.length < 6) {
    return { error: 'Tüm alanların doldurulması zorunludur.' }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    if (error) return { error: 'Bu e-posta adresi zaten kullanımda olabilir.' }
  } catch {
    return { error: 'Bu e-posta adresi zaten kullanımda olabilir.' }
  }

  redirect('/login?registered=1')
}

export async function handleLogout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fullName = String(formData.get('name') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()
  const { error } = await supabase.from('profiles').update({ full_name: fullName, address, updated_at: new Date().toISOString() }).eq('id', user.id)
  if (error) throw new Error(error.message)
}

export async function updatePassword(formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const password = String(formData.get('password') ?? '')
  if (password.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır.')
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}

