import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { QueryProvider } from '@/providers/query-client-provider';
import { ToastProvider } from '@/providers/toast-provider';

import keywordsData from '@/data/keywords.json';



import { GoogleAnalytics } from '@/app/components/GoogleAnalytics';
import { GoogleSearchConsoleVerification } from '@/app/components/GoogleSearchConsoleVerification';
import PageViewTrackerWrapper from '@/components/analytics/PageViewTrackerWrapper';
import { AnonymousSessionInitializer } from '@/components/anonymous-session/AnonymousSessionInitializer';


const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const { meta } = keywordsData;

export const metadata: Metadata = {
  metadataBase: new URL('https://ngebengkel.com'),
  title: {
    default: meta.title,
    template: '%s | Ngebengkel.com',
  },
  description: meta.description,
  keywords: meta.keywords.split(', '),
  authors: [{ name: 'Ngebengkel.com' }],
  creator: 'Ngebengkel.com',
  publisher: 'Ngebengkel.com',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://ngebengkel.com',
    siteName: 'Ngebengkel.com',
    title: meta.title,
    description: meta.description,
    images: [
      {
        url: 'https://ngebengkel.com/logo-circle.webp',
        width: 1200,
        height: 630,
        alt: 'Ngebengkel.com - cari bengkel promosi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    images: [
      {
        url: 'https://ngebengkel.com/logo-circle.webp',
        width: 1200,
        height: 630,
        alt: 'Ngebengkel.com - cari bengkel promosi',
      },
    ],
    creator: '@ngebengkel',
    site: '@ngebengkel',
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
  verification: {
    // Hanya masukkan verification code saja, tanpa prefix "google-site-verification="
    // Next.js akan otomatis menambahkan prefix ke meta tag
    google: 'kDq-qfEa-I1RlrzQE4xTZaPzJlncPlFoGG22jKbXg',// for ngebengkel.com
    
    // google: '-kDq-qfEa-I1RlrzQE4xTZaPzJlncPlFoGG22jKbXgc', // for www.ngebengkel.com
    // Add verification codes here when available
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://ngebengkel.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.webp', type: 'image/webp', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  category: 'Technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleSearchConsoleVerification />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <PageViewTrackerWrapper />
        <AnonymousSessionInitializer />
        <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
