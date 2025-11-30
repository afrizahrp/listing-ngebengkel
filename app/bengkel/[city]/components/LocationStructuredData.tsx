import { getCityData, getWorkshopsByLocation } from '@/lib/utils/location-data';
import { createSlug } from '@/lib/utils/slug';

export async function CityLocationStructuredData({ cityIdOrName }: { cityIdOrName: string }) {
  const city = await getCityData(cityIdOrName);
  
  if (!city) {
    return null;
  }

  const workshops = await getWorkshopsByLocation({ city: city.id });

  // Build CollectionPage structured data for city
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Daftar Bengkel di ${city.name}`,
    description: `Koleksi bengkel terpercaya di ${city.name}. Temukan bengkel terdekat untuk servis kendaraan Kamu.`,
    url: `https://ngebengkel.com/bengkel/${encodeURIComponent(createSlug(city.name))}`,
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
          name: city.name,
          item: `https://ngebengkel.com/bengkel/${encodeURIComponent(createSlug(city.name))}`,
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

