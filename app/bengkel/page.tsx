import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CTA } from '@/app/workshop/components/CTA';

export const metadata: Metadata = {
  title: 'Cari Bengkel Terdekat dengan Promo — Servis Mobil & Motor | Ngebengkel.com',
  description:
    'Temukan bengkel terdekat dengan promo menarik. Daftar lengkap bengkel terpercaya untuk servis mobil dan motor di seluruh Indonesia. Booking online, mudah dan cepat.',
  keywords: [
    'cari bengkel',
    'bengkel terdekat',
    'bengkel terpercaya',
    'promo bengkel',
    'servis mobil',
    'servis motor',
    'booking bengkel',
    'bengkel Indonesia',
  ],
  alternates: {
    canonical: 'https://ngebengkel.com/bengkel',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://ngebengkel.com/bengkel',
    siteName: 'Ngebengkel.com',
    title: 'Cari Bengkel Terdekat dengan Promo | Ngebengkel.com',
    description:
      'Temukan bengkel terdekat dengan promo menarik. Daftar bengkel terpercaya untuk servis mobil dan motor.',
    images: [
      {
        url: 'https://ngebengkel.com/logo-circle.webp',
        width: 1200,
        height: 630,
        alt: 'Cari Bengkel Terdekat - Ngebengkel.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cari Bengkel Terdekat dengan Promo | Ngebengkel.com',
    description:
      'Temukan bengkel terdekat dengan promo menarik. Daftar bengkel terpercaya untuk servis mobil dan motor.',
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

/**
 * Halaman listing bengkel dengan query parameter
 *
 * Supports:
 * - /bengkel?painPoint=ac-tidak-dingin (filter by pain point)
 * - /bengkel?q=search+query (search query)
 * - /bengkel (show all)
 */
export default function BengkelPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center py-12 text-muted-foreground">Memuat bengkel...</div>}>
        <CTA variant="section" />
      </Suspense>
    </main>
  );
}


