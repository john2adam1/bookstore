import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Banner } from "@/components/Banner";
import Link from 'next/link';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Kitob Do'koni - Eng sara kitoblar to'plami",
    template: "%s | Kitob Do'koni"
  },
  description: "Siz qidirgan eng sara kitoblar endi bir joyda! Ishonchli va tezkor yetkazib berish xizmati.",
  keywords: ["kitoblar", "kitob do'koni", "uzbekistan kitoblar", "online kitob sotib olish", "book store"],
  authors: [{ name: "Kitob Do'koni" }],
  creator: "Kitob Do'koni",
  publisher: "Kitob Do'koni",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Kitob Do'koni - Eng sara kitoblar to'plami",
    description: "Siz qidirgan eng sara kitoblar endi bir joyda! Ishonchli va tezkor yetkazib berish xizmati.",
    url: 'https://ebookstore.uz',
    siteName: "Kitob Do'koni",
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kitob Do'koni - Eng sara kitoblar to'plami",
    description: "Siz qidirgan eng sara kitoblar endi bir joyda! Ishonchli va tezkor yetkazib berish xizmati.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: "Kitob Do'koni",
  description: "Siz qidirgan eng sara kitoblar endi bir joyda! Ishonchli va tezkor yetkazib berish xizmati.",
  url: 'https://ebookstore.uz',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://ebookstore.uz/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} flex min-h-full flex-col`}>
        <Navbar />
        <Banner />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t bg-white py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="text-sm text-gray-500 font-medium">
              © {new Date().getFullYear()} BookStore. All rights reserved. Premium Design.
            </div>
            <div className="mt-4">
              <Link
                href="/admin-login"
                className="text-[10px] uppercase tracking-widest text-slate-300 hover:text-[#002B5B] transition-all font-bold"
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
