import type { Metadata } from 'next';
import { getCityData, getDistrictData, getSubdistrictData, getWorkshopsByLocation } from '@/lib/utils/location-data';
import { SubdistrictLocationStructuredData } from './components/LocationStructuredData';

export async function generateMetadata({
  params,
}: {
  params: { city: string; district: string; subdistrict: string };
}): Promise<Metadata> {
  const cityIdOrName = decodeURIComponent(params?.city ?? '').trim();
  const districtIdOrName = decodeURIComponent(params?.district ?? '').trim();
  const subdistrictIdOrName = decodeURIComponent(params?.subdistrict ?? '').trim();
  
  // Use try-catch for better error handling
  let city, district, subdistrict, workshops;
  try {
    [city, district, subdistrict] = await Promise.all([
      getCityData(cityIdOrName),
      getDistrictData(districtIdOrName),
      getSubdistrictData(subdistrictIdOrName),
    ]);
    
    workshops = (city && district && subdistrict)
      ? await getWorkshopsByLocation({ 
          city: city.id, 
          district: district.id, 
          subdistrict: subdistrict.id 
        })
      : [];
  } catch (error) {
    console.error('Error in generateMetadata for subdistrict:', cityIdOrName, districtIdOrName, subdistrictIdOrName, error);
    city = null;
    district = null;
    subdistrict = null;
    workshops = [];
  }

  // If data not found, return indexable metadata with generic content
  if (!city || !district || !subdistrict) {
    const normalizedCityName = cityIdOrName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const normalizedDistrictName = districtIdOrName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const normalizedSubdistrictName = subdistrictIdOrName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const canonicalUrl = `https://ngebengkel.com/bengkel/${encodeURIComponent(cityIdOrName.toLowerCase())}/${encodeURIComponent(districtIdOrName.toLowerCase())}/${encodeURIComponent(subdistrictIdOrName.toLowerCase())}`;
    
    return {
      title: `Daftar Bengkel di ${normalizedSubdistrictName}, ${normalizedDistrictName}, ${normalizedCityName} | Ngebengkel.com`,
      description: `Cari bengkel terdekat di ${normalizedSubdistrictName}, ${normalizedDistrictName}, ${normalizedCityName}. Temukan bengkel berkualitas untuk servis kendaraan Kamu. Booking online, mudah dan cepat.`,
      keywords: [
        `bengkel ${normalizedSubdistrictName}`,
        `bengkel di ${normalizedSubdistrictName} ${normalizedDistrictName}`,
        `servis mobil ${normalizedSubdistrictName}`,
        `servis motor ${normalizedSubdistrictName}`,
        `bengkel terdekat ${normalizedSubdistrictName}`,
        normalizedSubdistrictName,
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
        title: `Daftar Bengkel di ${normalizedSubdistrictName}, ${normalizedDistrictName}, ${normalizedCityName}`,
        description: `Cari bengkel terdekat di ${normalizedSubdistrictName}, ${normalizedDistrictName}, ${normalizedCityName}. Temukan bengkel berkualitas untuk servis kendaraan Kamu.`,
        images: [
          {
            url: 'https://ngebengkel.com/logo-circle.webp',
            width: 1200,
            height: 630,
            alt: `Daftar Bengkel di ${normalizedSubdistrictName}, ${normalizedDistrictName}, ${normalizedCityName} - Ngebengkel.com`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Daftar Bengkel di ${normalizedSubdistrictName}, ${normalizedDistrictName}, ${normalizedCityName}`,
        description: `Cari bengkel terdekat di ${normalizedSubdistrictName}, ${normalizedDistrictName}, ${normalizedCityName}. Temukan bengkel berkualitas untuk servis kendaraan Kamu.`,
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
        'geo.placename': `${normalizedSubdistrictName}, ${normalizedDistrictName}, ${normalizedCityName}`,
      },
    };
  }

  const cityName = city.name;
  const districtName = district.name;
  const subdistrictName = subdistrict.name;
  const workshopCount = workshops.length;
  const title = `Daftar Bengkel di ${subdistrictName}, ${districtName}, ${cityName} - ${workshopCount} Bengkel Terdekat`;
  const description = `Cari bengkel terdekat di ${subdistrictName}, ${districtName}, ${cityName}. Temukan ${workshopCount > 0 ? `${workshopCount} bengkel` : 'bengkel'} berkualitas untuk servis kendaraan Kamu di ${subdistrictName}, ${districtName}, ${cityName}. Booking online, mudah dan cepat.`;

  const canonicalUrl = `https://ngebengkel.com/bengkel/${encodeURIComponent(cityName.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(districtName.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(subdistrictName.toLowerCase().replace(/\s+/g, '-'))}`;

  return {
    title,
    description,
    keywords: [
      `bengkel ${subdistrictName}`,
      `bengkel di ${subdistrictName} ${districtName}`,
      `servis mobil ${subdistrictName}`,
      `servis motor ${subdistrictName}`,
      `bengkel terdekat ${subdistrictName}`,
      `bengkel terpercaya ${cityName}`,
      subdistrictName,
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
          url: 'https://ngebengkel.com/logo-circle.webp',
          width: 1200,
          height: 630,
          alt: `Daftar Bengkel di ${subdistrictName}, ${districtName}, ${cityName} - Ngebengkel.com`,
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
      'geo.placename': `${subdistrictName}, ${districtName}, ${cityName}`,
    },
  };
}

export default async function SubdistrictLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { city: string; district: string; subdistrict: string };
}) {
  const cityIdOrName = decodeURIComponent(params?.city ?? '').trim();
  const districtIdOrName = decodeURIComponent(params?.district ?? '').trim();
  const subdistrictIdOrName = decodeURIComponent(params?.subdistrict ?? '').trim();
  
  return (
    <>
      <SubdistrictLocationStructuredData 
        cityIdOrName={cityIdOrName} 
        districtIdOrName={districtIdOrName}
        subdistrictIdOrName={subdistrictIdOrName}
      />
      {children}
    </>
  );
}

