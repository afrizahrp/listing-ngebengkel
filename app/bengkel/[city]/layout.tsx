import type { Metadata } from 'next';
import { getCityData, getWorkshopsByLocation } from '@/lib/utils/location-data';
import { CityLocationStructuredData } from './components/LocationStructuredData';

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  const city = await getCityData(cityIdOrName);
  const workshops = city ? await getWorkshopsByLocation({ city: city.id }) : [];

  if (!city) {
    return {
      title: 'Bengkel di Kota Tidak Ditemukan',
      description: 'Halaman bengkel untuk kota yang Kamu cari tidak ditemukan.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cityName = city?.name || cityIdOrName;
  const workshopCount = workshops.length;
  const title = `Daftar Bengkel di ${cityName} - ${workshopCount} Bengkel Terdekat`;
  const description = `Cari bengkel terdekat di ${cityName}. Temukan ${workshopCount > 0 ? `${workshopCount} bengkel` : 'bengkel'} berkualitas untuk servis kendaraan Kamu di ${cityName}. Booking online, mudah dan cepat.`;

  const canonicalUrl = `https://ngebengkel.com/bengkel/${encodeURIComponent(cityName.toLowerCase().replace(/\s+/g, '-'))}`;

  return {
    title,
    description,
    keywords: [
      `bengkel ${cityName}`,
      `bengkel di ${cityName}`,
      `servis mobil ${cityName}`,
      `servis motor ${cityName}`,
      `bengkel terdekat ${cityName}`,
      `bengkel terpercaya ${cityName}`,
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
          url: 'https://ngebengkel.com/logo-circle.webp',
          width: 1200,
          height: 630,
          alt: `Daftar Bengkel di ${cityName} - Ngebengkel.com`,
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

export default async function CityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { city: string };
}) {
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  
  return (
    <>
      <CityLocationStructuredData cityIdOrName={cityIdOrName} />
      {children}
    </>
  );
}

