import type { Metadata } from 'next';
import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

async function getPainPointData(slug: string) {
  try {
    const token = await getServiceTokenWithRefresh();
    // Use detail endpoint dengan slug (service sudah support slug lookup)
    const res = await fetch(`${apiBase}/pain-points/${encodeURIComponent(slug)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.data || null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching pain point data for SEO:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params?.slug ?? '';
  const painPoint = await getPainPointData(slug);

  if (!painPoint) {
    return {
      title: 'Masalah Kendaraan Tidak Ditemukan',
      description: 'Halaman masalah kendaraan yang Kamu cari tidak ditemukan.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${painPoint.title} - Solusi Bengkel Terpercaya | Ngebengkel.com`;
  const description =
    painPoint.description ||
    `${painPoint.title}. Temukan bengkel terpercaya untuk mengatasi masalah kendaraan Kamu. Dapatkan solusi terbaik dengan harga terjangkau.`;

  const keywords = [
    painPoint.title,
    ...(painPoint.keywords || []),
    'bengkel',
    'servis kendaraan',
    'perbaikan kendaraan',
    'bengkel terdekat',
    'bengkel terpercaya',
  ].filter(Boolean);

  const canonicalUrl = `https://ngebengkel.com/masalah/${painPoint.slug}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: canonicalUrl,
      siteName: 'Ngebengkel.com',
      title,
      description,
      images: painPoint.imageUrl
        ? [
            {
              url: painPoint.imageUrl,
              width: 1200,
              height: 630,
              alt: painPoint.title,
            },
          ]
        : [
            {
              url: 'https://ngebengkel.com/logo.webp',
              width: 1200,
              height: 630,
              alt: `${painPoint.title} - Ngebengkel.com`,
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: painPoint.imageUrl ? [painPoint.imageUrl] : ['https://ngebengkel.com/logo.webp'],
      creator: '@ngebengkel',
      site: '@ngebengkel',
    },
    alternates: {
      canonical: canonicalUrl,
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
}

export default async function PainPointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

