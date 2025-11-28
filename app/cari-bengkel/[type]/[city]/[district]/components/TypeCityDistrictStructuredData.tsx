import { getCityData, getDistrictData, getWorkshopTypeData, getWorkshopsByTypeAndLocation } from '@/lib/utils/location-data';
import { createSlug } from '@/lib/utils/slug';

export async function TypeCityDistrictStructuredData({ 
  typeIdOrName, 
  cityIdOrName,
  districtIdOrName
}: { 
  typeIdOrName: string; 
  cityIdOrName: string;
  districtIdOrName: string;
}) {
  const [type, city, district] = await Promise.all([
    getWorkshopTypeData(typeIdOrName),
    getCityData(cityIdOrName),
    getDistrictData(districtIdOrName),
  ]);
  
  if (!type || !city || !district) {
    return null;
  }

  const workshops = await getWorkshopsByTypeAndLocation({ 
    typeId: type.id, 
    city: city.id, 
    district: district.id 
  });

  // Build CollectionPage structured data for type + city + district
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Cari Bengkel ${type.name} di ${district.name}, ${city.name}`,
    description: `Koleksi bengkel ${type.name} terpercaya di ${district.name}, ${city.name}. Temukan bengkel ${type.name} terdekat untuk servis kendaraan Anda.`,
    url: `https://ngebengkel.com/cari-bengkel/${encodeURIComponent(createSlug(type.name))}/${encodeURIComponent(createSlug(city.name))}/${encodeURIComponent(createSlug(district.name))}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: workshops.length,
      itemListElement: workshops.slice(0, 10).map((workshop: { id: string; name: string; slug?: string }, index: number) => ({
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
          name: type.name,
          item: `https://ngebengkel.com/cari-bengkel/${encodeURIComponent(createSlug(type.name))}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: city.name,
          item: `https://ngebengkel.com/cari-bengkel/${encodeURIComponent(createSlug(type.name))}/${encodeURIComponent(createSlug(city.name))}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: district.name,
          item: `https://ngebengkel.com/cari-bengkel/${encodeURIComponent(createSlug(type.name))}/${encodeURIComponent(createSlug(city.name))}/${encodeURIComponent(createSlug(district.name))}`,
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




