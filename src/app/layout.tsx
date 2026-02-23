import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from 'next/link';
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Banner } from "@/components/Banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modern Book Store",
  description: "Browse and buy your favorite books with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex min-h-full flex-col`}>
        <Navbar />
        <Banner />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t bg-white py-12">
          <div className="container mx-auto px-4 text-center ">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} BookStore. All rights reserved. Premium Design.
            </div>
            <div className="mt-4">
              <Link
                href="/admin-login"
                className="text-[10px] uppercase tracking-widest text-gray-300 hover:text-gray-400 transition-colors"
                aria-label="Staff Access"
              >
                System Access
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
