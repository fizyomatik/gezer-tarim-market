'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers' // 1. WICHTIG: Cookies Modul importieren

// Giriş Durumu için Tip Tanımı
export interface AuthState {
  error: string
}

// 1. GİRİŞ YAPMA FONKSİYONU (handleLogin)
export async function handleLogin(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-posta ve şifre zorunludur.' }
  }

  let isSuccess = false
  let userName = ''
  let userRole = 'customer' // Standardmäßig ist jeder ein normaler Kunde

  try {
    // Örnek mock kontrol:
    if ((email === 'admin@gezer.com' || email === 'baykara.e41@gmail.com') && password === '123456') {
      isSuccess = true
      userName = email === 'baykara.e41@gmail.com' ? 'Baykara Admin' : 'Ahmet Yılmaz'
      userRole = 'admin' // Wenn es diese E-Mail ist, ändern wir die Rolle zu 'admin'
    } else {
      return { error: 'E-posta adresi veya şifre hatalı.' }
    }
  } catch (dbError) {
    return { error: 'Sistemde bir hata oluştu, lütfen tekrar deneyin.' }
  }

  // DIKKAT: redirect() her zaman try-catch bloğunun DIŞINDA çağrılmalıdır!
  if (isSuccess) {
    const cookieStore = await cookies()
    
    // Zuvor eingebaut: Speichert den Namen für die Navbar (z.B. für den Buchstaben "A")
    cookieStore.set('user_name', userName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    // NEU HIER: Speichert die Rolle ('admin'). Das liest das Admin-Panel aus, um den Zugriff zu erlauben!
    cookieStore.set('user_role', userRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 gün boyunca oturum açık kalır
      path: '/'
    })

    // Nach dem Login leiten wir den Admin direkt in sein Admin-Panel weiter
    if (userRole === 'admin') {
      redirect('/admin')
    } else {
      redirect('/')
    }
  }

  return { error: 'Geçersiz kimlik bilgileri.' }
}

// 2. KAYIT OLMA FONKSİYONU (handleRegister)
export async function handleRegister(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Tüm alanların doldurulması zorunludur.' }
  }

  let isSuccess = false

  try {
    isSuccess = true
  } catch (error) {
    return { error: 'Bu e-posta adresi zaten kullanımda olabilir.' }
  }

  if (isSuccess) {
    redirect('/login')
  }

  return { error: 'Kayıt işlemi başarısız oldu.' }
}

// 3. ÇIKIŞ YAPMA FONKSİYONU (handleLogout)
export async function handleLogout() {
  const cookieStore = await cookies()
  
  // Çerezleri sil
  cookieStore.delete('user_name')
  cookieStore.delete('user_role')
  
  // Giriş sayfasına yönlendir
  redirect('/login')
}

