import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hub Artikel & Panduan Kendaraan | Ngebengkel.com',
  description:
    'Baca artikel dan panduan lengkap tentang perawatan, perbaikan, dan masalah kendaraan. Dilengkapi estimasi biaya servis dan rekomendasi bengkel terpercaya di seluruh Indonesia.',
  keywords: [
    'artikel otomotif',
    'panduan servis kendaraan',
    'tips perawatan mobil',
    'tips perawatan motor',
    'estimasi biaya servis',
    'bengkel terpercaya',
    'panduan perbaikan kendaraan',
    'AC mobil tidak dingin',
    'cara servis motor',
  ],
  alternates: {
    canonical: 'https://ngebengkel.com/hub/artikel',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://ngebengkel.com/hub/artikel',
    siteName: 'Ngebengkel.com',
    title: 'Hub Artikel & Panduan Kendaraan | Ngebengkel.com',
    description:
      'Baca artikel dan panduan lengkap tentang perawatan dan perbaikan kendaraan. Estimasi biaya dan rekomendasi bengkel terpercaya.',
    images: [
      {
        url: 'https://ngebengkel.com/logo-circle.webp',
        width: 1200,
        height: 630,
        alt: 'Hub Artikel Kendaraan - Ngebengkel.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub Artikel & Panduan Kendaraan | Ngebengkel.com',
    description:
      'Baca artikel dan panduan lengkap tentang perawatan dan perbaikan kendaraan. Estimasi biaya dan rekomendasi bengkel terpercaya.',
    images: ['https://ngebengkel.com/logo-circle.webp'],
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
};

export default function HubArtikelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
