import type { Metadata } from 'next';
import { getCityData, getDistrictData, getWorkshopTypeData, getWorkshopsByTypeAndLocation } from '@/lib/utils/location-data';
import { createSlug } from '@/lib/utils/slug';
import { TypeCityDistrictStructuredData } from './components/TypeCityDistrictStructuredData';

export async function generateMetadata({
  params,
}: {
  params: { type: string; city: string; district: string };
}): Promise<Metadata> {
  const typeIdOrName = decodeURIComponent(params?.type ?? '');
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  const districtIdOrName = decodeURIComponent(params?.district ?? '');
  
  // Use try-catch for better error handling
  let type, city, district, workshops;
  try {
    [type, city, district] = await Promise.all([
      getWorkshopTypeData(typeIdOrName),
      getCityData(cityIdOrName),
      getDistrictData(districtIdOrName),
    ]);
    
    workshops = (type && city && district) 
      ? await getWorkshopsByTypeAndLocation({ typeId: type.id, city: city.id, district: district.id })
      : [];
  } catch (error) {
    console.error('Error in generateMetadata for type-city-district:', typeIdOrName, cityIdOrName, districtIdOrName, error);
    type = null;
    city = null;
    district = null;
    workshops = [];
  }

  // If data not found, return indexable metadata with generic content
  if (!type || !city || !district) {
    const normalizedTypeName = typeIdOrName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const normalizedCityName = cityIdOrName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const normalizedDistrictName = districtIdOrName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const typeSlug = typeIdOrName.toLowerCase();
    const citySlug = cityIdOrName.toLowerCase();
    const districtSlug = districtIdOrName.toLowerCase();
    const canonicalUrl = `https://ngebengkel.com/cari-bengkel/${encodeURIComponent(typeSlug)}/${encodeURIComponent(citySlug)}/${encodeURIComponent(districtSlug)}`;
    
    return {
      title: `Cari Bengkel ${normalizedTypeName} di ${normalizedDistrictName}, ${normalizedCityName} | Ngebengkel.com`,
      description: `Cari bengkel ${normalizedTypeName} terdekat di ${normalizedDistrictName}, ${normalizedCityName}. Temukan bengkel ${normalizedTypeName} berkualitas untuk servis kendaraan Kamu. Booking online, mudah dan cepat.`,
      keywords: [
        `cari bengkel ${normalizedTypeName} ${normalizedDistrictName} ${normalizedCityName}`,
        `bengkel ${normalizedTypeName} ${normalizedDistrictName}`,
        `bengkel ${normalizedTypeName} di ${normalizedDistrictName} ${normalizedCityName}`,
        `servis ${normalizedTypeName} ${normalizedDistrictName}`,
        `bengkel ${normalizedTypeName} terdekat ${normalizedDistrictName}`,
        `cari bengkel ${normalizedTypeName} ${normalizedCityName}`,
        `bengkel ${normalizedTypeName}`,
        normalizedTypeName,
        normalizedDistrictName,
        normalizedCityName,
        'bengkel',
        'servis kendaraan',
      ],
      openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Ngebengkel.com',
        title: `Cari Bengkel ${normalizedTypeName} di ${normalizedDistrictName}, ${normalizedCityName}`,
        description: `Cari bengkel ${normalizedTypeName} terdekat di ${normalizedDistrictName}, ${normalizedCityName}. Temukan bengkel ${normalizedTypeName} berkualitas untuk servis kendaraan Kamu.`,
        images: [
          {
            url: 'https://ngebengkel.com/logo-circle.webp',
            width: 1200,
            height: 630,
            alt: `Cari Bengkel ${normalizedTypeName} di ${normalizedDistrictName}, ${normalizedCityName} - Ngebengkel.com`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Cari Bengkel ${normalizedTypeName} di ${normalizedDistrictName}, ${normalizedCityName}`,
        description: `Cari bengkel ${normalizedTypeName} terdekat di ${normalizedDistrictName}, ${normalizedCityName}. Temukan bengkel ${normalizedTypeName} berkualitas untuk servis kendaraan Kamu.`,
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
        'geo.placename': `${normalizedDistrictName}, ${normalizedCityName}`,
      },
    };
  }

  const typeName = type.name;
  const cityName = city.name;
  const districtName = district.name;
  const workshopCount = workshops.length;
  const title = `Cari Bengkel ${typeName} di ${districtName}, ${cityName} - ${workshopCount} Bengkel Terdekat`;
  const description = `Cari bengkel ${typeName} terdekat di ${districtName}, ${cityName}. Temukan ${workshopCount > 0 ? `${workshopCount} bengkel ${typeName}` : `bengkel ${typeName}`} berkualitas untuk servis kendaraan Kamu di ${districtName}, ${cityName}. Booking online, mudah dan cepat.`;

  const typeSlug = createSlug(typeName);
  const citySlug = createSlug(cityName);
  const districtSlug = createSlug(districtName);
  const canonicalUrl = `https://ngebengkel.com/cari-bengkel/${encodeURIComponent(typeSlug)}/${encodeURIComponent(citySlug)}/${encodeURIComponent(districtSlug)}`;

  // Generate SEO keywords
  const keywords = [
    `cari bengkel ${typeName} ${districtName} ${cityName}`,
    `bengkel ${typeName} ${districtName}`,
    `bengkel ${typeName} di ${districtName} ${cityName}`,
    `servis ${typeName} ${districtName}`,
    `bengkel ${typeName} terdekat ${districtName}`,
    `bengkel ${typeName} terpercaya ${cityName}`,
    `cari bengkel ${typeName} ${cityName}`,
    `bengkel ${typeName}`,
    typeName,
    districtName,
    cityName,
    'bengkel',
    'servis kendaraan',
  ];

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
      images: [
        {
          url: 'https://ngebengkel.com/logo-circle.webp',
          width: 1200,
          height: 630,
          alt: `Cari Bengkel ${typeName} di ${districtName}, ${cityName} - Ngebengkel.com`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
      'geo.placename': `${districtName}, ${cityName}`,
    },
  };
}

export default async function TypeCityDistrictLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { type: string; city: string; district: string };
}) {
  const typeIdOrName = decodeURIComponent(params?.type ?? '');
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  const districtIdOrName = decodeURIComponent(params?.district ?? '');
  
  return (
    <>
      <TypeCityDistrictStructuredData 
        typeIdOrName={typeIdOrName} 
        cityIdOrName={cityIdOrName}
        districtIdOrName={districtIdOrName}
      />
      {children}
    </>
  );
}




