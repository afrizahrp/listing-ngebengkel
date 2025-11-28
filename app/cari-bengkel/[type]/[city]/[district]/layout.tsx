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
  
  const [type, city, district] = await Promise.all([
    getWorkshopTypeData(typeIdOrName),
    getCityData(cityIdOrName),
    getDistrictData(districtIdOrName),
  ]);
  
  const workshops = (type && city && district) 
    ? await getWorkshopsByTypeAndLocation({ typeId: type.id, city: city.id, district: district.id })
    : [];

  if (!type || !city || !district) {
    return {
      title: 'Bengkel Tidak Ditemukan',
      description: 'Halaman bengkel untuk jenis dan lokasi yang Anda cari tidak ditemukan.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const typeName = type.name;
  const cityName = city.name;
  const districtName = district.name;
  const workshopCount = workshops.length;
  const title = `Cari Bengkel ${typeName} di ${districtName}, ${cityName} - ${workshopCount} Bengkel Terdekat`;
  const description = `Cari bengkel ${typeName} terdekat di ${districtName}, ${cityName}. Temukan ${workshopCount > 0 ? `${workshopCount} bengkel ${typeName}` : `bengkel ${typeName}`} berkualitas untuk servis kendaraan Anda di ${districtName}, ${cityName}. Booking online, mudah dan cepat.`;

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
          url: 'https://ngebengkel.com/logo.webp',
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
      images: ['https://ngebengkel.com/logo.webp'],
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




