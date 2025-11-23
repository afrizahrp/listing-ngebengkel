import type { Metadata } from 'next';
import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';
import { createSlug } from '@/lib/utils/slug';
import { WorkshopStructuredData } from './components/WorkshopStructuredData';

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

async function getWorkshopData(slugOrId: string) {
  try {
    const token = await getServiceTokenWithRefresh();
    
    // Try to fetch by ID first
    let res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(slugOrId)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    // If not found, try to find by slug
    if (res.status === 404) {
      const allRes = await fetch(`${apiBase}/waiting-list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (allRes.ok) {
        const allData = await allRes.json().catch(() => ({}));
        const items = Array.isArray(allData) ? allData : (allData?.data || []);
        
        const foundItem = items.find((item: { name?: string; id?: string; slug?: string }) => {
          if (!item.name) return false;
          const itemSlug = item.slug || createSlug(item.name);
          return itemSlug === slugOrId || item.id === slugOrId;
        });

        if (foundItem) {
          return foundItem;
        }
      }
    }

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.data || data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching workshop data for SEO:', error);
    return null;
  }
}

async function getPromos(waitingListId: string) {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(waitingListId)}/promo`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.data || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching promos for SEO:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const slugOrId = params?.id ?? '';
  const workshop = await getWorkshopData(slugOrId);

  if (!workshop) {
    return {
      title: 'Bengkel Tidak Ditemukan',
      description: 'Halaman bengkel yang Anda cari tidak ditemukan.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const workshopName = workshop.name || 'Bengkel';
  const description = workshop.description || 
    `${workshopName} - Bengkel terpercaya di ${workshop.city || workshop.province || 'Indonesia'}. Layanan servis kendaraan berkualitas dengan harga terjangkau.`;
  
  const categoryName = workshop.categoryName || '';
  const locationParts = [
    workshop.subdistrict,
    workshop.district,
    workshop.city,
    workshop.province,
  ].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : 'Indonesia';

  // Get promos for enhanced description
  const promos = await getPromos(workshop.id);
  const hasPromo = promos.length > 0;
  const promoText = hasPromo 
    ? ` Tersedia promo menarik: ${promos.slice(0, 2).map((p: { title: string }) => p.title).join(', ')}.`
    : '';

  const fullDescription = `${description}${promoText} Hubungi kami untuk informasi lebih lanjut.`;

  // Build title with location and category if available
  const titleParts = [workshopName];
  if (categoryName) titleParts.push(categoryName);
  if (workshop.city) titleParts.push(workshop.city);
  const title = titleParts.join(' - ');

  const canonicalUrl = `https://ngebengkel.com/workshop/${workshop.slug || createSlug(workshopName)}`;

  return {
    title,
    description: fullDescription,
    keywords: [
      workshopName,
      'bengkel',
      categoryName,
      workshop.city,
      workshop.province,
      'servis mobil',
      'servis motor',
      'bengkel terdekat',
      ...(hasPromo ? ['promo bengkel', 'diskon servis'] : []),
    ].filter(Boolean),
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: canonicalUrl,
      siteName: 'Ngebengkel.com',
      title,
      description: fullDescription,
      images: workshop.logo ? [
        {
          url: workshop.logo,
          width: 1200,
          height: 630,
          alt: `${workshopName} - ${categoryName || 'Bengkel'}`,
        },
      ] : [
        {
          url: 'https://ngebengkel.com/logo.webp',
          width: 1200,
          height: 630,
          alt: `${workshopName} - Ngebengkel.com`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: fullDescription,
      images: workshop.logo ? [workshop.logo] : ['https://ngebengkel.com/logo.webp'],
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
    other: {
      'geo.region': 'ID',
      'geo.placename': location,
    },
  };
}

export default async function WorkshopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const slugOrId = params?.id ?? '';
  
  return (
    <>
      <WorkshopStructuredData slugOrId={slugOrId} />
      {children}
    </>
  );
}

