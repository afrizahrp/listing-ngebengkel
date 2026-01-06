import type { Metadata } from 'next';
import { getCityData, getWorkshopsByLocation } from '@/lib/utils/location-data';
import { CityLocationStructuredData } from './components/LocationStructuredData';

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  
  // Use try-catch with better error handling
  let city, workshops;
  try {
    city = await getCityData(cityIdOrName);
    workshops = city ? await getWorkshopsByLocation({ city: city.id }) : [];
  } catch (error) {
    console.error('Error in generateMetadata for city:', cityIdOrName, error);
    city = null;
    workshops = [];
  }

  // If city not found, return indexable metadata with generic content
  // This allows Google to index the page even if data is temporarily unavailable
  if (!city) {
    const normalizedCityName = cityIdOrName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const canonicalUrl = `https://ngebengkel.com/bengkel/${encodeURIComponent(cityIdOrName.toLowerCase())}`;
    
    return {
      title: `Daftar Bengkel di ${normalizedCityName} | Ngebengkel.com`,
      description: `Cari bengkel terdekat di ${normalizedCityName}. Temukan bengkel berkualitas untuk servis kendaraan Kamu. Booking online, mudah dan cepat.`,
      keywords: [
        `bengkel ${normalizedCityName}`,
        `bengkel di ${normalizedCityName}`,
        `servis mobil ${normalizedCityName}`,
        `servis motor ${normalizedCityName}`,
        `bengkel terdekat ${normalizedCityName}`,
        normalizedCityName,
        'bengkel',
        'servis kendaraan',
      ],
      openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Ngebengkel.com',
        title: `Daftar Bengkel di ${normalizedCityName}`,
        description: `Cari bengkel terdekat di ${normalizedCityName}. Temukan bengkel berkualitas untuk servis kendaraan Kamu.`,
        images: [
          {
            url: 'https://ngebengkel.com/logo-circle.webp',
            width: 1200,
            height: 630,
            alt: `Daftar Bengkel di ${normalizedCityName} - Ngebengkel.com`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Daftar Bengkel di ${normalizedCityName}`,
        description: `Cari bengkel terdekat di ${normalizedCityName}. Temukan bengkel berkualitas untuk servis kendaraan Kamu.`,
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
        'geo.placename': normalizedCityName,
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

