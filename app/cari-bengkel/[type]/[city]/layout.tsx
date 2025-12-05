import type { Metadata } from 'next';
import { getCityData, getWorkshopTypeData, getWorkshopsByTypeAndLocation } from '@/lib/utils/location-data';
import { createSlug } from '@/lib/utils/slug';
import { TypeCityLocationStructuredData } from './components/TypeCityStructuredData';

export async function generateMetadata({
  params,
}: {
  params: { type: string; city: string };
}): Promise<Metadata> {
  const typeIdOrName = decodeURIComponent(params?.type ?? '');
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  
  const [type, city] = await Promise.all([
    getWorkshopTypeData(typeIdOrName),
    getCityData(cityIdOrName),
  ]);
  
  const workshops = (type && city) 
    ? await getWorkshopsByTypeAndLocation({ typeId: type.id, city: city.id })
    : [];

  if (!type || !city) {
    return {
      title: 'Bengkel Tidak Ditemukan',
      description: 'Halaman bengkel untuk jenis dan lokasi yang Kamu cari tidak ditemukan.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const typeName = type.name;
  const cityName = city.name;
  const workshopCount = workshops.length;
  const title = `Cari Bengkel ${typeName} di ${cityName} - ${workshopCount} Bengkel Terdekat`;
  const description = `Cari bengkel ${typeName} terdekat di ${cityName}. Temukan ${workshopCount > 0 ? `${workshopCount} bengkel ${typeName}` : `bengkel ${typeName}`} berkualitas untuk servis kendaraan Kamu di ${cityName}. Booking online, mudah dan cepat.`;

  const typeSlug = createSlug(typeName);
  const citySlug = createSlug(cityName);
  const canonicalUrl = `https://ngebengkel.com/cari-bengkel/${encodeURIComponent(typeSlug)}/${encodeURIComponent(citySlug)}`;

  // Generate SEO keywords
  const keywords = [
    `cari bengkel ${typeName} ${cityName}`,
    `bengkel ${typeName} ${cityName}`,
    `bengkel ${typeName} di ${cityName}`,
    `servis ${typeName} ${cityName}`,
    `bengkel ${typeName} terdekat ${cityName}`,
    `bengkel ${typeName} terpercaya ${cityName}`,
    `cari bengkel ${typeName}`,
    `bengkel ${typeName}`,
    typeName,
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
          alt: `Cari Bengkel ${typeName} di ${cityName} - Ngebengkel.com`,
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
      'geo.placename': cityName,
    },
  };
}

export default async function TypeCityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { type: string; city: string };
}) {
  const typeIdOrName = decodeURIComponent(params?.type ?? '');
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  
  return (
    <>
      <TypeCityLocationStructuredData 
        typeIdOrName={typeIdOrName} 
        cityIdOrName={cityIdOrName} 
      />
      {children}
    </>
  );
}




