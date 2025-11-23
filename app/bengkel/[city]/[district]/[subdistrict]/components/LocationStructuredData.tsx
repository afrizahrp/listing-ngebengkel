import { getCityData, getDistrictData, getSubdistrictData, getWorkshopsByLocation } from '@/lib/utils/location-data';
import { createSlug } from '@/lib/utils/slug';

export async function SubdistrictLocationStructuredData({ 
  cityIdOrName, 
  districtIdOrName,
  subdistrictIdOrName,
}: { 
  cityIdOrName: string; 
  districtIdOrName: string;
  subdistrictIdOrName: string;
}) {
  const [city, district, subdistrict] = await Promise.all([
    getCityData(cityIdOrName),
    getDistrictData(districtIdOrName),
    getSubdistrictData(subdistrictIdOrName),
  ]);
  
  if (!city || !district || !subdistrict) {
    return null;
  }

  const workshops = await getWorkshopsByLocation({ 
    city: city.id, 
    district: district.id, 
    subdistrict: subdistrict.id 
  });

  // Build CollectionPage structured data for subdistrict
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Daftar Bengkel di ${subdistrict.name}, ${district.name}, ${city.name}`,
    description: `Koleksi bengkel terpercaya di ${subdistrict.name}, ${district.name}, ${city.name}. Temukan bengkel terdekat untuk servis kendaraan Anda.`,
    url: `https://ngebengkel.com/bengkel/${encodeURIComponent(createSlug(city.name))}/${encodeURIComponent(createSlug(district.name))}/${encodeURIComponent(createSlug(subdistrict.name))}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: workshops.length,
      itemListElement: workshops.slice(0, 10).map((workshop: { id: string; name: string; slug?: string; address?: string }, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LocalBusiness',
          '@id': `https://ngebengkel.com/workshop/${workshop.slug || createSlug(workshop.name)}`,
          name: workshop.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: workshop.address,
            addressLocality: subdistrict.name,
            addressRegion: district.name,
            addressRegion2: city.name,
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
        {
          '@type': 'ListItem',
          position: 4,
          name: subdistrict.name,
          item: `https://ngebengkel.com/bengkel/${encodeURIComponent(createSlug(city.name))}/${encodeURIComponent(createSlug(district.name))}/${encodeURIComponent(createSlug(subdistrict.name))}`,
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

