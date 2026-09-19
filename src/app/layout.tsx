import { getCategories } from '../lib/catalog';
import { getCompanySettings } from "../lib/settings";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CartProvider } from "../components/CartProvider";
import { CompanySettingsProvider } from "../components/CompanySettingsProvider";
import { createSupabaseServerClient } from "../lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCompanySettings();
  return { title: `${settings.companyName} | Tarımın Güvenilir Adresi`, description: 'Tohum, gübre, zirai ilaç, tarım aletleri ve profesyonel servis hizmetleri.' };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, categories] = await Promise.all([getCompanySettings(), getCategories()]);
  let userName: string | undefined;
  let userEmail: string | undefined;
  let isAdmin = false;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    userName = user?.user_metadata?.full_name;
    userEmail = user?.email;
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
      userName = profile?.full_name || userName;
      isAdmin = profile?.role === "admin";
    }
  } catch {
    // Public visitors can still browse if only the authentication service is unavailable.
  }
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CompanySettingsProvider settings={settings}>
          <CartProvider>
          <Navbar isAdmin={isAdmin} userName={userName} userEmail={userEmail} categories={categories} />
          {children}
          <Footer categories={categories} />
          </CartProvider>
        </CompanySettingsProvider>
        </body>
    </html>
  );
}
