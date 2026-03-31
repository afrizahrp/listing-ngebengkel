import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hub Masalah Kendaraan — Panduan Lengkap Servis Mobil & Motor | Ngebengkel.com',
  description:
    'Temukan solusi untuk semua masalah kendaraan Anda. Panduan lengkap penyebab, cara diagnosis, estimasi biaya, dan rekomendasi bengkel terpercaya untuk servis mobil dan motor.',
  keywords: [
    'masalah kendaraan',
    'masalah mobil',
    'masalah motor',
    'servis kendaraan',
    'bengkel terdekat',
    'perbaikan kendaraan',
    'diagnosis kendaraan',
    'AC tidak dingin',
    'rem blong',
    'mesin panas',
  ],
  alternates: {
    canonical: 'https://ngebengkel.com/hub/masalah',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://ngebengkel.com/hub/masalah',
    siteName: 'Ngebengkel.com',
    title: 'Hub Masalah Kendaraan | Ngebengkel.com',
    description:
      'Temukan solusi untuk semua masalah kendaraan Anda. Panduan lengkap dengan rekomendasi bengkel terpercaya.',
    images: [
      {
        url: 'https://ngebengkel.com/logo-circle.webp',
        width: 1200,
        height: 630,
        alt: 'Hub Masalah Kendaraan - Ngebengkel.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub Masalah Kendaraan | Ngebengkel.com',
    description:
      'Temukan solusi untuk semua masalah kendaraan Anda. Panduan lengkap dengan rekomendasi bengkel terpercaya.',
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

export default function HubMasalahLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
