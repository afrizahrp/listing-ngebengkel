import { getCityData, getWorkshopTypeData, getWorkshopsByTypeAndLocation } from '@/lib/utils/location-data';
import { createSlug } from '@/lib/utils/slug';

export async function TypeCityLocationStructuredData({ 
  typeIdOrName, 
  cityIdOrName 
}: { 
  typeIdOrName: string; 
  cityIdOrName: string;
}) {
  const [type, city] = await Promise.all([
    getWorkshopTypeData(typeIdOrName),
    getCityData(cityIdOrName),
  ]);
  
  if (!type || !city) {
    return null;
  }

  const workshops = await getWorkshopsByTypeAndLocation({ typeId: type.id, city: city.id });

  // Build CollectionPage structured data for type + city
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Cari Bengkel ${type.name} di ${city.name}`,
    description: `Koleksi bengkel ${type.name} terpercaya di ${city.name}. Temukan bengkel ${type.name} terdekat untuk servis kendaraan Anda.`,
    url: `https://ngebengkel.com/cari-bengkel/${encodeURIComponent(createSlug(type.name))}/${encodeURIComponent(createSlug(city.name))}`,
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
            addressLocality: city.name,
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




