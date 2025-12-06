import type { MetadataRoute } from 'next';
import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';
import { createSlug } from '@/lib/utils/slug';

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

type WaitingListItem = {
  id: string;
  name: string;
  slug?: string;
  city?: string;
  district?: string;
  subdistrict?: string;
  updatedAt?: string;
  workshopTypes?: Array<{ id: string; name: string }>;
};

// Cache for location lookups to reduce API calls
const locationCache = new Map<string, string | null>();

async function getLocationName(type: 'city' | 'district' | 'subdistrict', id: string): Promise<string | null> {
  const cacheKey = `${type}:${id}`;
  
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey)!;
  }

  try {
    const token = await getServiceTokenWithRefresh();
    const endpoint = type === 'city' ? 'sys_city' : type === 'district' ? 'sys_district' : 'sys_subdistrict';
    const res = await fetch(`${apiBase}/${endpoint}/${encodeURIComponent(id)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'force-cache', // Cache location data
      next: { revalidate: 86400 }, // 24 hours
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const location = data?.data || data;
      const name = location?.name || null;
      locationCache.set(cacheKey, name);
      return name;
    }
    locationCache.set(cacheKey, null);
    return null;
  } catch {
    locationCache.set(cacheKey, null);
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
    'https://ngebengkel.com';

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const token = await getServiceTokenWithRefresh();
    
    // Fetch all data in parallel for better performance
    const [waitingListRes, painPointsRes, articlesRes] = await Promise.allSettled([
      fetch(`${apiBase}/waiting-list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 3600 }, // 1 hour cache
      }),
      fetch(`${apiBase}/pain-points?isActive=true&limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 3600 },
      }),
      fetch(`${apiBase}/wks/articles?status=PUBLISHED&limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 3600 },
      }),
    ]);

    // Process waiting list (workshops & locations)
    if (waitingListRes.status === 'fulfilled' && waitingListRes.value.ok) {
      const data = (await waitingListRes.value.json()) as {
        data?: WaitingListItem[];
      } | WaitingListItem[];
      const items: WaitingListItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      // Track unique locations to avoid duplicates
      const citySlugs = new Set<string>();
      const districtSlugs = new Set<string>();
      const subdistrictSlugs = new Set<string>();
      const typeCitySlugs = new Set<string>();
      const typeCityDistrictSlugs = new Set<string>();

      for (const item of items) {
        // Add workshop detail page
        const workshopSlug = item.slug || createSlug(item.name);
        routes.push({
          url: `${baseUrl}/workshop/${encodeURIComponent(workshopSlug)}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        // Add location pages
        if (item.city) {
          const cityName = await getLocationName('city', item.city);
          if (cityName) {
            const citySlug = createSlug(cityName);
            if (!citySlugs.has(citySlug)) {
              citySlugs.add(citySlug);
              routes.push({
                url: `${baseUrl}/bengkel/${encodeURIComponent(citySlug)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
              });
            }

            // District pages
            if (item.district) {
              const districtName = await getLocationName('district', item.district);
              if (districtName) {
                const districtSlug = createSlug(districtName);
                const districtKey = `${citySlug}/${districtSlug}`;
                if (!districtSlugs.has(districtKey)) {
                  districtSlugs.add(districtKey);
                  routes.push({
                    url: `${baseUrl}/bengkel/${encodeURIComponent(citySlug)}/${encodeURIComponent(districtSlug)}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.5,
                  });
                }

                // Subdistrict pages
                if (item.subdistrict) {
                  const subdistrictName = await getLocationName('subdistrict', item.subdistrict);
                  if (subdistrictName) {
                    const subdistrictSlug = createSlug(subdistrictName);
                    const subdistrictKey = `${districtKey}/${subdistrictSlug}`;
                    if (!subdistrictSlugs.has(subdistrictKey)) {
                      subdistrictSlugs.add(subdistrictKey);
                      routes.push({
                        url: `${baseUrl}/bengkel/${encodeURIComponent(citySlug)}/${encodeURIComponent(districtSlug)}/${encodeURIComponent(subdistrictSlug)}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.4,
                      });
                    }
                  }
                }

                // Type + city + district pages
                if (item.workshopTypes?.[0]) {
                  const { name } = item.workshopTypes[0];
                  if (name) {
                    const typeSlug = createSlug(name);
                    const typeCityDistrictKey = `${typeSlug}/${citySlug}/${districtSlug}`;
                    if (!typeCityDistrictSlugs.has(typeCityDistrictKey)) {
                      typeCityDistrictSlugs.add(typeCityDistrictKey);
                      routes.push({
                        url: `${baseUrl}/cari-bengkel/${encodeURIComponent(typeSlug)}/${encodeURIComponent(citySlug)}/${encodeURIComponent(districtSlug)}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.65,
                      });
                    }
                  }
                }
              }
            }

            // Type + city pages
            if (item.workshopTypes?.[0]) {
              const { name } = item.workshopTypes[0];
              if (name) {
                const typeSlug = createSlug(name);
                const typeCityKey = `${typeSlug}/${citySlug}`;
                if (!typeCitySlugs.has(typeCityKey)) {
                  typeCitySlugs.add(typeCityKey);
                  routes.push({
                    url: `${baseUrl}/cari-bengkel/${encodeURIComponent(typeSlug)}/${encodeURIComponent(citySlug)}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                  });
                }
              }
            }
          }
        }
      }
    }

    // Process pain points
    if (painPointsRes.status === 'fulfilled' && painPointsRes.value.ok) {
      const painPointsData = (await painPointsRes.value.json()) as {
        data?: Array<{ slug: string; updatedAt?: string }>;
      } | Array<{ slug: string; updatedAt?: string }>;
      const painPoints: Array<{ slug: string; updatedAt?: string }> = Array.isArray(painPointsData)
        ? painPointsData
        : Array.isArray(painPointsData?.data)
          ? painPointsData.data
          : [];

      for (const painPoint of painPoints) {
        if (painPoint.slug) {
          routes.push({
            url: `${baseUrl}/masalah/${encodeURIComponent(painPoint.slug)}`,
            lastModified: painPoint.updatedAt ? new Date(painPoint.updatedAt) : new Date(),
            changeFrequency: 'monthly', // Changed from weekly - pain points don't update often
            priority: 0.6,
          });
        }
      }
    }

    // Process published articles
    if (articlesRes.status === 'fulfilled' && articlesRes.value.ok) {
      const articlesData = (await articlesRes.value.json()) as {
        data?: Array<{ slug: string; publishedAt?: string; updatedAt?: string }>;
      } | Array<{ slug: string; publishedAt?: string; updatedAt?: string }>;
      
      const articles: Array<{ slug: string; publishedAt?: string; updatedAt?: string }> = Array.isArray(articlesData)
        ? articlesData
        : Array.isArray(articlesData?.data)
          ? articlesData.data
          : [];

      for (const article of articles) {
        if (article.slug) {
          routes.push({
            url: `${baseUrl}/artikel/${encodeURIComponent(article.slug)}`,
            lastModified: article.publishedAt ? new Date(article.publishedAt) : article.updatedAt ? new Date(article.updatedAt) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
          });
        }
      }
    }

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Sitemap still generates with at least homepage
  }

  return routes;
}