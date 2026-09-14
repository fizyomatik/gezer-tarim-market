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

export const metadata: Metadata = {
  title: "Gezer Tarım Market | Tarımın Güvenilir Adresi",
  description: "Tohum, gübre, zirai ilaç, tarım aletleri ve profesyonel servis hizmetleri.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
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
    // The public shell remains renderable before Supabase environment setup.
  }
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CompanySettingsProvider>
          <CartProvider>
          <Navbar isAdmin={isAdmin} userName={userName} userEmail={userEmail} />
          {children}
          <Footer />
          </CartProvider>
        </CompanySettingsProvider>
        </body>
    </html>
  );
}
