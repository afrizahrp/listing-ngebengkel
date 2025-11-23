import type { Metadata } from 'next';
import { getCityData, getDistrictData, getWorkshopsByLocation } from '@/lib/utils/location-data';
import { DistrictLocationStructuredData } from './components/LocationStructuredData';

export async function generateMetadata({
  params,
}: {
  params: { city: string; district: string };
}): Promise<Metadata> {
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  const districtIdOrName = decodeURIComponent(params?.district ?? '');
  
  const [city, district] = await Promise.all([
    getCityData(cityIdOrName),
    getDistrictData(districtIdOrName),
  ]);
  
  const workshops = (city && district) 
    ? await getWorkshopsByLocation({ city: city.id, district: district.id })
    : [];

  if (!city || !district) {
    return {
      title: 'Bengkel di Lokasi Tidak Ditemukan',
      description: 'Halaman bengkel untuk lokasi yang Anda cari tidak ditemukan.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cityName = city.name;
  const districtName = district.name;
  const workshopCount = workshops.length;
  const title = `Daftar Bengkel di ${districtName}, ${cityName} - ${workshopCount} Bengkel Terdekat`;
  const description = `Cari bengkel terdekat di ${districtName}, ${cityName}. Temukan ${workshopCount > 0 ? `${workshopCount} bengkel` : 'bengkel'} berkualitas untuk servis kendaraan Anda di ${districtName}, ${cityName}. Booking online, mudah dan cepat.`;

  const canonicalUrl = `https://ngebengkel.com/bengkel/${encodeURIComponent(cityName.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(districtName.toLowerCase().replace(/\s+/g, '-'))}`;

  return {
    title,
    description,
    keywords: [
      `bengkel ${districtName}`,
      `bengkel di ${districtName} ${cityName}`,
      `servis mobil ${districtName}`,
      `servis motor ${districtName}`,
      `bengkel terdekat ${districtName}`,
      `bengkel terpercaya ${cityName}`,
      districtName,
      cityName,
      'bengkel',
      'servis kendaraan',
    ],
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
          alt: `Daftar Bengkel di ${districtName}, ${cityName} - Ngebengkel.com`,
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

export default async function DistrictLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { city: string; district: string };
}) {
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  const districtIdOrName = decodeURIComponent(params?.district ?? '');
  
  return (
    <>
      <DistrictLocationStructuredData 
        cityIdOrName={cityIdOrName} 
        districtIdOrName={districtIdOrName} 
      />
      {children}
    </>
  );
}

