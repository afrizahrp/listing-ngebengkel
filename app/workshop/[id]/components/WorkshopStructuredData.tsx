import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';
import { createSlug } from '@/lib/utils/slug';

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

async function getWorkshopData(slugOrId: string) {
  try {
    const token = await getServiceTokenWithRefresh();
    
    let res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(slugOrId)}`, {
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
        
        const foundItem = items.find((item: { name?: string; id?: string; slug?: string }) => {
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
  const locationParts = [
    workshop.address,
    workshop.subdistrict,
    workshop.district,
    workshop.city,
    workshop.province,
  ].filter(Boolean);
  const fullAddress = locationParts.join(', ');

  // Build LocalBusiness structured data
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://ngebengkel.com/workshop/${workshop.slug || createSlug(workshop.name)}`,
    name: workshop.name,
    description: workshop.description || `${workshop.name} - Bengkel terpercaya di ${workshop.city || workshop.province || 'Indonesia'}`,
    image: workshop.logo || 'https://ngebengkel.com/logo.webp',
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
    ...(workshop.categoryName ? { category: workshop.categoryName } : {}),
  };

  // Build Offer/Promo structured data if promos exist
  const offers = promos
    .filter((promo: any) => promo && promo.title) // Filter out invalid promos
    .map((promo: {
      id: string;
      title: string;
      description: string | null;
      promoType: string;
      valuePercent?: number | null;
      valueNominal?: number | null;
      startAt?: string | null;
      endAt?: string | null;
    }) => {
      const offer: any = {
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

