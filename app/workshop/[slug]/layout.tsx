import type { Metadata } from 'next';
import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';
import { createSlug } from '@/lib/utils/slug';
import { getCityData, getProvinceData } from '@/lib/utils/location-data';
import { WorkshopStructuredData } from './components/WorkshopStructuredData';

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

async function getWorkshopData(slugOrId: string) {
  try {
    const token = await getServiceTokenWithRefresh();
    
    // Try to fetch by ID first
    const res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(slugOrId)}`, {
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
        
        // Cari item yang slug-nya match (gunakan kolom slug dari database, bukan createSlug dari name)
        const foundItem = items.find((item: { slug?: string | null; name?: string; id?: string }) => {
          // Prioritas: gunakan kolom slug dari database jika tersedia
          if (item.slug && item.slug.toLowerCase() === slugOrId.toLowerCase()) {
            return true;
          }
          // Fallback: cek ID
          if (item.id === slugOrId) {
            return true;
          }
          // Fallback terakhir: generate slug dari name (untuk backward compatibility)
          if (item.name) {
            const itemSlug = createSlug(item.name);
            return itemSlug === slugOrId;
          }
          return false;
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

async function getPainPointsByWorkshopTypes(workshopTypes: Array<{ id?: string; name?: string }>) {
  try {
    if (!workshopTypes || workshopTypes.length === 0) {
      return [];
    }

    const token = await getServiceTokenWithRefresh();
    const workshopTypeIds = workshopTypes
      .map((wt) => wt.id)
      .filter(Boolean) as string[];

    if (workshopTypeIds.length === 0) {
      return [];
    }

    // Fetch pain points yang terkait dengan workshop types ini
    // Note: Kita perlu fetch semua pain points aktif dan filter berdasarkan workshop type mapping
    // Untuk sekarang, kita fetch popular pain points dan filter berdasarkan keywords yang match dengan workshop type names
    const res = await fetch(`${apiBase}/pain-points?isActive=true&isPopular=true&limit=50`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const painPoints = Array.isArray(data) ? data : (data?.data || []);

      // Filter pain points yang keywords-nya match dengan workshop type names
      const workshopTypeNames = workshopTypes
        .map((wt) => wt.name?.toLowerCase())
        .filter(Boolean) as string[];

      const matchedPainPoints = painPoints.filter((pp: { keywords?: string[] }) => {
        if (!pp.keywords || pp.keywords.length === 0) return false;
        return pp.keywords.some((keyword: string) =>
          workshopTypeNames.some((typeName) =>
            keyword.toLowerCase().includes(typeName) || typeName.includes(keyword.toLowerCase()),
          ),
        );
      });

      return matchedPainPoints.slice(0, 5); // Limit to 5 most relevant
    }

    return [];
  } catch (error) {
    console.error('Error fetching pain points for SEO:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slugOrId = params?.slug ?? '';
  
  // Use try-catch for better error handling
  let workshop;
  try {
    workshop = await getWorkshopData(slugOrId);
  } catch (error) {
    console.error('Error in generateMetadata for workshop:', slugOrId, error);
    workshop = null;
  }

  // If workshop not found, return indexable metadata with generic content
  if (!workshop) {
    const normalizedSlug = slugOrId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const canonicalUrl = `https://ngebengkel.com/workshop/${slugOrId}`;
    
    return {
      title: `${normalizedSlug} - Bengkel Terpercaya | Ngebengkel.com`,
      description: `${normalizedSlug} - Bengkel terpercaya untuk servis kendaraan berkualitas dengan harga terjangkau. Layanan servis mobil dan motor terbaik. Hubungi kami untuk informasi lebih lanjut.`,
      keywords: [
        normalizedSlug,
        'bengkel',
        'servis kendaraan',
        'bengkel terdekat',
        'bengkel terpercaya',
        'servis mobil',
        'servis motor',
      ],
      openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Ngebengkel.com',
        title: `${normalizedSlug} - Bengkel Terpercaya`,
        description: `${normalizedSlug} - Bengkel terpercaya untuk servis kendaraan berkualitas dengan harga terjangkau.`,
        images: [
          {
            url: 'https://ngebengkel.com/logo-circle.webp',
            width: 1200,
            height: 630,
            alt: `${normalizedSlug} - Ngebengkel.com`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${normalizedSlug} - Bengkel Terpercaya`,
        description: `${normalizedSlug} - Bengkel terpercaya untuk servis kendaraan berkualitas dengan harga terjangkau.`,
        images: ['https://ngebengkel.com/logo-circle.webp'],
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
      },
    };
  }

  const workshopName = workshop.name || 'Bengkel';
  
  // Fetch actual location names (server-side) to avoid showing IDs in meta tags
  const [cityData, provinceData] = await Promise.all([
    workshop.city ? getCityData(workshop.city) : null,
    workshop.province ? getProvinceData(workshop.province) : null,
  ]);

  const cityName = cityData?.name || null;
  const provinceName = provinceData?.name || null;
  
  const description = workshop.description || 
    `${workshopName} - Bengkel terpercaya di ${cityName || provinceName || 'Indonesia'}. Layanan servis kendaraan berkualitas dengan harga terjangkau.`;
  
  const categoryName = workshop.categoryName || '';
  const locationParts = [
    workshop.subdistrict,
    workshop.district,
    cityName || workshop.city,
    provinceName || workshop.province,
  ].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : 'Indonesia';

  // Get workshop types for keyword generation
  const workshopTypes = workshop.workshopTypes || [];
  const typeNames = workshopTypes.map((t: { name?: string }) => t?.name || '').filter(Boolean);
  const categoryNameLower = (categoryName || '').toLowerCase();
  const typeNamesLower = typeNames.map((n: string) => n.toLowerCase());
  
  // Determine category type (mobil/motor) from category name
  const isCategoryMobil = /mobil|car|automobile|otomotif/i.test(categoryNameLower);
  const isCategoryMotor = /motor|motorcycle|sepeda motor/i.test(categoryNameLower);

  // Get pain points related to this workshop's service types
  const relatedPainPoints = await getPainPointsByWorkshopTypes(workshopTypes);
  const painPointKeywords: string[] = [];
  relatedPainPoints.forEach((pp: { title?: string; keywords?: string[] }) => {
    if (pp.title) painPointKeywords.push(pp.title);
    if (pp.keywords && Array.isArray(pp.keywords)) {
      painPointKeywords.push(...pp.keywords);
    }
  });

  // Get promos for enhanced description
  const promos = await getPromos(workshop.id);
  const hasPromo = promos.length > 0;
  const promoText = hasPromo 
    ? ` Tersedia promo menarik: ${promos.slice(0, 2).map((p: { title: string }) => p.title).join(', ')}.`
    : '';

  const fullDescription = `${description}${promoText} Hubungi kami untuk informasi lebih lanjut.`;

  // Build title with actual location names (not IDs) for proper SEO
  const titleParts = [workshopName];
  if (categoryName) titleParts.push(categoryName);
  if (cityName) titleParts.push(cityName);
  const title = `${titleParts.join(' - ')} | Ngebengkel.com`;

  const canonicalUrl = `https://ngebengkel.com/workshop/${workshop.slug || createSlug(workshopName)}`;

  // Build keywords array with category and type-based keywords
  const keywords: string[] = [
    workshopName,
    'bengkel',
    categoryName,
    ...typeNames,
    cityName || workshop.city,
    provinceName || workshop.province,
    'bengkel terdekat',
    // Add pain point keywords untuk SEO
    ...painPointKeywords.slice(0, 10), // Limit to 10 untuk menghindari keyword stuffing
  ];

  // Add category-based keywords (wks_Category)
  if (isCategoryMobil) {
    keywords.push('bengkel mobil', 'servis mobil', 'bengkel mobil terdekat', 'servis mobil terdekat');
  }
  if (isCategoryMotor) {
    keywords.push('bengkel motor', 'servis motor', 'bengkel motor terdekat', 'servis motor terdekat');
  }

  // Add combination keywords: category + type (wks_Category + wks_WorkshopType)
  // Example: "bengkel AC mobil terdekat" jika category=mobil dan type=AC
  // Example: "bengkel injeksi motor terdekat" jika category=motor dan type=injeksi
  typeNames.forEach((typeName: string) => {
    const typeNameLower = typeName.toLowerCase();
    
    if (isCategoryMobil) {
      // Kombinasi: type + mobil
      keywords.push(`bengkel ${typeNameLower} mobil`, `servis ${typeNameLower} mobil`);
      keywords.push(`bengkel ${typeNameLower} mobil terdekat`, `servis ${typeNameLower} mobil terdekat`);
    }
    
    if (isCategoryMotor) {
      // Kombinasi: type + motor
      keywords.push(`bengkel ${typeNameLower} motor`, `servis ${typeNameLower} motor`);
      keywords.push(`bengkel ${typeNameLower} motor terdekat`, `servis ${typeNameLower} motor terdekat`);
    }
  });

  // Add type-specific keywords (jika type mengandung kata kunci spesifik)
  typeNamesLower.forEach((typeNameLower: string) => {
    if (/ac|air conditioner|pendingin/i.test(typeNameLower)) {
      keywords.push('bengkel AC', 'servis AC', 'bengkel AC terdekat');
    }
    if (/injeksi|injection/i.test(typeNameLower)) {
      keywords.push('bengkel injeksi', 'servis injeksi', 'bengkel injeksi terdekat');
    }
    if (/karburator|carburetor/i.test(typeNameLower)) {
      keywords.push('bengkel karburator', 'servis karburator', 'bengkel karburator terdekat');
    }
    if (/rem|brake/i.test(typeNameLower)) {
      keywords.push('bengkel rem', 'servis rem', 'bengkel rem terdekat');
    }
  });

  if (hasPromo) {
    keywords.push('promo bengkel', 'diskon servis');
  }

  return {
    title,
    description: fullDescription,
    keywords: keywords.filter(Boolean),
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
          url: 'https://ngebengkel.com/logo-circle.webp',
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
      images: workshop.logo ? [workshop.logo] : ['https://ngebengkel.com/logo-circle.webp'],
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
  params: { slug: string };
}) {
  const slugOrId = params?.slug ?? '';
  
  // Note: Redirect 301 dari ID ke slug sudah di-handle oleh middleware.ts
  // Middleware akan redirect sebelum layout ini dijalankan
  
  return (
    <>
      <WorkshopStructuredData slugOrId={slugOrId} />
      {children}
    </>
  );
}

