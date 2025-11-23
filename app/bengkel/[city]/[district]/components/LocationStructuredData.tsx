import { getCityData, getDistrictData, getWorkshopsByLocation } from '@/lib/utils/location-data';
import { createSlug } from '@/lib/utils/slug';

export async function DistrictLocationStructuredData({ 
  cityIdOrName, 
  districtIdOrName 
}: { 
  cityIdOrName: string; 
  districtIdOrName: string;
}) {
  const [city, district] = await Promise.all([
    getCityData(cityIdOrName),
    getDistrictData(districtIdOrName),
  ]);
  
  if (!city || !district) {
    return null;
  }

  const workshops = await getWorkshopsByLocation({ city: city.id, district: district.id });

  // Build CollectionPage structured data for district
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Daftar Bengkel di ${district.name}, ${city.name}`,
    description: `Koleksi bengkel terpercaya di ${district.name}, ${city.name}. Temukan bengkel terdekat untuk servis kendaraan Anda.`,
    url: `https://ngebengkel.com/bengkel/${encodeURIComponent(createSlug(city.name))}/${encodeURIComponent(createSlug(district.name))}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: workshops.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemListElement: workshops.slice(0, 10).map((workshop: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LocalBusiness',
          '@id': `https://ngebengkel.com/workshop/${workshop.slug || createSlug(workshop.name)}`,
          name: workshop.name,
          address: {
            '@type': 'PostalAddress',
            addressLocality: district.name,
            addressRegion: city.name,
            addressCountry: 'ID',
          },
        },
      })),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Beranda',
          item: 'https://ngebengkel.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: city.name,
          item: `https://ngebengkel.com/bengkel/${encodeURIComponent(createSlug(city.name))}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: district.name,
          item: `https://ngebengkel.com/bengkel/${encodeURIComponent(createSlug(city.name))}/${encodeURIComponent(createSlug(district.name))}`,
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

