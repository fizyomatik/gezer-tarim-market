'use server'

import { redirect } from 'next/navigation'

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

  try {
    // TODO: Gerçek Veritabanı kontrolü (bcrypt.compare vb.)
    // Örnek mock kontrol:
    if (email === 'admin@gezer.com' && password === '123456') {
      // Burada JWT, Cookie veya NextAuth session işlemlerini yapacaksın
      isSuccess = true
    } else {
      return { error: 'E-posta adresi veya şifre hatalı.' }
    }
  } catch (dbError) {
    return { error: 'Sistemde bir hata oluştu, lütfen tekrar deneyin.' }
  }

  // DIKKAT: redirect() her zaman try-catch bloğunun DIŞINDA çağrılmalıdır!
  if (isSuccess) {
    redirect('/')
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
    // TODO: Veritabanına yeni kullanıcı ekleme (Prisma, Mongoose, Supabase vb.)
    // const hashedPassword = await bcrypt.hash(password, 10);
    // await db.user.create({ data: { name, email, password: hashedPassword } });
    
    isSuccess = true
  } catch (error) {
    return { error: 'Bu e-posta adresi zaten kullanımda olabilir.' }
  }

  if (isSuccess) {
    redirect('/login') // Kayıt başarılı olunca giriş sayfasına yönlendir
  }

  return { error: 'Kayıt işlemi başarısız oldu.' }
}
