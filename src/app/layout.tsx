import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CartProvider } from "../components/CartProvider";
import { CompanySettingsProvider } from "../components/CompanySettingsProvider";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("user_role")?.value === "admin";
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CompanySettingsProvider>
          <CartProvider>
          <Navbar isAdmin={isAdmin} />
          {children}
          <Footer />
          </CartProvider>
        </CompanySettingsProvider>
        </body>
    </html>
  );
}
