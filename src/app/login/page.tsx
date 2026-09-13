'use client'

import { useActionState } from 'react'
import { handleLogin } from '../actions'
import Link from 'next/link' // Markaya tıklayınca ana sayfaya dönebilmek için

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(handleLogin, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        
        {/* Marka ve Başlık Alanı (Navbar ile uyumlu) */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-black tracking-tight text-[#174d32]">
              GEZER
            </h2>
            <p className="mt-1 text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase">
              Tarım Market
            </p>
          </Link>
          <h3 className="mt-6 text-xl font-bold text-gray-900">
            Hesabınıza giriş yapın
          </h3>
        </div>

        <form action={formAction} className="mt-8 space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ornek@eposta.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#174d32] focus:outline-none focus:ring-1 focus:ring-[#174d32] sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#174d32] focus:outline-none focus:ring-1 focus:ring-[#174d32] sm:text-sm"
              />
            </div>
          </div>

          {/* Hata Mesajı */}
          {state?.error && (
            <p className="text-sm font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
              {state.error}
            </p>
          )}

          {/* Buton (Tema Rengine Uygun) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center rounded-lg bg-[#174d32] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#123d27] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174d32] disabled:opacity-50"
            >
              {isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>

        {/* Kayıt Ol Linki */}
        <p className="text-center text-sm text-gray-600">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-medium text-[#174d32] hover:underline">
            Kayıt olun
          </Link>
        </p>

      </div>
    </div>
  )
}
