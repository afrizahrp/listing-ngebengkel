import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';
import { createSlug } from '@/lib/utils/slug';

interface WorkshopItem {
  name?: string;
  id?: string;
  slug?: string;
}

interface PromoItem {
  id: string;
  title: string;
  description: string | null;
  promoType: string;
  valuePercent?: number | null;
  valueNominal?: number | null;
  startAt?: string | null;
  endAt?: string | null;
}

interface StructuredDataOffer {
  '@type': string;
  name: string;
  description: string;
  category: string;
  availability: string;
  seller: {
    '@id': string;
  };
  validFrom?: string;
  validThrough?: string;
  price?: string;
  priceCurrency?: string;
  priceSpecification?: {
    '@type': string;
    priceCurrency: string;
    price: string;
    valueAddedTaxIncluded: boolean;
    referenceQuantity: {
      '@type': string;
      value: number;
      unitCode: string;
    };
  };
  [key: string]: unknown; // Allow additional properties for schema.org flexibility
}

interface StructuredDataLocalBusiness {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  description: string;
  image: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo?: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  email?: string;
  url: string;
  priceRange: string;
  category?: string;
  areaServed?: Array<{
    '@type': string;
    name: string;
  }>;
  additionalType?: string[];
  [key: string]: unknown; // Allow additional properties for schema.org flexibility
}

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

async function getWorkshopData(slugOrId: string) {
  try {
    const token = await getServiceTokenWithRefresh();
    
    const res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(slugOrId)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      const allRes = await fetch(`${apiBase}/waiting-list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (allRes.ok) {
        const allData = await allRes.json().catch(() => ({}));
        const items = Array.isArray(allData) ? allData : (allData?.data || []);
        
        const foundItem = items.find((item: WorkshopItem) => {
          if (!item.name) return false;
          const itemSlug = item.slug || createSlug(item.name);
          return itemSlug === slugOrId || item.id === slugOrId;
        });

        if (foundItem) {
          return foundItem;
        }
      }
    }

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.data || data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching workshop data for structured data:', error);
    return null;
  }
}

async function getPromos(waitingListId: string) {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(waitingListId)}/promo`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.data || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching promos for structured data:', error);
    return [];
  }
}

export async function WorkshopStructuredData({ slugOrId }: { slugOrId: string }) {
  const workshop = await getWorkshopData(slugOrId);
  
  if (!workshop) {
    return null;
  }

  const promos = await getPromos(workshop.id);

  // Determine service type based on category (wks_Category) - sesuai skema Prisma
  // wks_WorkshopCategory.name digunakan untuk menentukan kategori utama (mobil/motor)
  const categoryName = (workshop.categoryName || '').toLowerCase();
  const isCategoryMobil = /mobil|car|automobile|otomotif/i.test(categoryName);
  const isCategoryMotor = /motor|motorcycle|sepeda motor/i.test(categoryName);
  
  // Use specific service type based on category (wks_Category)
  let serviceType = 'LocalBusiness';
  if (isCategoryMobil && !isCategoryMotor) {
    serviceType = 'AutoRepair';
  } else if (isCategoryMotor && !isCategoryMobil) {
    serviceType = 'MotorcycleRepair';
  } else if (isCategoryMobil && isCategoryMotor) {
    // Both, use AutoRepair as primary (more common)
    serviceType = 'AutoRepair';
  }

  // Build keywords from category (wks_Category) and type (wks_WorkshopType)
  const keywords: string[] = [];
  if (workshop.categoryName) {
    keywords.push(workshop.categoryName.toLowerCase());
  }
  
  // Add type names (wks_WorkshopType.name)
  const workshopTypes = workshop.workshopTypes || [];
  const typeNames: string[] = [];
  workshopTypes.forEach((t: { name?: string }) => {
    if (t?.name) {
      const typeNameLower = t.name.toLowerCase();
      typeNames.push(typeNameLower);
      keywords.push(typeNameLower);
      
      // Add combination keywords: type + category
      if (isCategoryMobil) {
        keywords.push(`${typeNameLower} mobil`, `bengkel ${typeNameLower} mobil terdekat`);
      }
      if (isCategoryMotor) {
        keywords.push(`${typeNameLower} motor`, `bengkel ${typeNameLower} motor terdekat`);
      }
    }
  });

  // Build service area (AreaServed) based on location
  const areaServed: Array<{ '@type': string; name: string }> = [];
  if (workshop.city) {
    areaServed.push({
      '@type': 'City',
      name: workshop.city,
    });
  }
  if (workshop.district) {
    areaServed.push({
      '@type': 'City',
      name: `${workshop.district}, ${workshop.city || ''}`,
    });
  }
  if (workshop.subdistrict) {
    areaServed.push({
      '@type': 'City',
      name: `${workshop.subdistrict}, ${workshop.district || ''}, ${workshop.city || ''}`,
    });
  }

  // Build LocalBusiness structured data with service type
  const localBusiness: StructuredDataLocalBusiness = {
    '@context': 'https://schema.org',
    '@type': serviceType,
    '@id': `https://ngebengkel.com/workshop/${workshop.slug || createSlug(workshop.name)}`,
    name: workshop.name,
    description: workshop.description || `${workshop.name} - Bengkel terpercaya di ${workshop.city || workshop.province || 'Indonesia'}`,
    image: workshop.logo || 'https://ngebengkel.com/logo-circle.webp',
    address: {
      '@type': 'PostalAddress',
      streetAddress: workshop.address,
      addressLocality: workshop.city,
      addressRegion: workshop.province,
      addressCountry: 'ID',
    },
    geo: workshop.latitude && workshop.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: typeof workshop.latitude === 'string' ? parseFloat(workshop.latitude) : workshop.latitude,
      longitude: typeof workshop.longitude === 'string' ? parseFloat(workshop.longitude) : workshop.longitude,
    } : undefined,
    telephone: workshop.phone || workshop.mobile || undefined,
    email: workshop.email || undefined,
    url: `https://ngebengkel.com/workshop/${workshop.slug || createSlug(workshop.name)}`,
    priceRange: '$$',
  };

  // Add category if available
  if (workshop.categoryName) {
    localBusiness.category = workshop.categoryName;
  }

  // Add service area if available
  if (areaServed.length > 0) {
    localBusiness.areaServed = areaServed;
  }

  // Add keywords as additionalType for better SEO
  if (keywords.length > 0) {
    localBusiness.additionalType = keywords.map(k => `https://schema.org/${k.replace(/\s+/g, '')}`);
  }

  // Build Offer/Promo structured data if promos exist
  const offers: StructuredDataOffer[] = promos
    .filter((promo: PromoItem) => promo && promo.title) // Filter out invalid promos
    .map((promo: PromoItem) => {
      const offer: StructuredDataOffer = {
        '@type': 'Offer',
        name: promo.title,
        description: promo.description || promo.title,
        category: 'Automotive Service',
        availability: 'https://schema.org/InStock',
        seller: {
          '@id': localBusiness['@id'],
        },
      };

      if (promo.startAt) {
        offer.validFrom = promo.startAt;
      }
      if (promo.endAt) {
        offer.validThrough = promo.endAt;
      }

      if (promo.promoType === 'DISCOUNT_PERCENT' && promo.valuePercent) {
        offer.priceSpecification = {
          '@type': 'UnitPriceSpecification',
          priceCurrency: 'IDR',
          price: '0',
          valueAddedTaxIncluded: true,
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: 1,
            unitCode: 'C62', // unit
          },
        };
        offer.description = `${promo.description || promo.title} - Diskon ${promo.valuePercent}%`;
      } else if (promo.promoType === 'DISCOUNT_NOMINAL' && promo.valueNominal) {
        offer.price = promo.valueNominal.toString();
        offer.priceCurrency = 'IDR';
      } else if (promo.promoType === 'FREE_CHECKLIST') {
        offer.price = '0';
        offer.priceCurrency = 'IDR';
        offer.description = `${promo.description || promo.title} - Gratis`;
      }

      return offer;
    });

  // Combine structured data - use @graph if multiple items, otherwise single object
  const structuredData = offers.length > 0
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          localBusiness,
          ...offers,
        ],
      }
    : localBusiness;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

