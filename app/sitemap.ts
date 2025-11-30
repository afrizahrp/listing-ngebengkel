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

async function getLocationName(type: 'city' | 'district' | 'subdistrict', id: string): Promise<string | null> {
  try {
    const token = await getServiceTokenWithRefresh();
    const endpoint = type === 'city' ? 'sys_city' : type === 'district' ? 'sys_district' : 'sys_subdistrict';
    const res = await fetch(`${apiBase}/${endpoint}/${encodeURIComponent(id)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const location = data?.data || data;
      return location?.name || null;
    }
    return null;
  } catch {
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

  // Tambahkan halaman detail workshop dan lokasi dari daftar WL
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/waiting-list`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = (await res.json()) as {
        data?: WaitingListItem[];
      } | WaitingListItem[];
      const items: WaitingListItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      // Track unique locations untuk menghindari duplikasi
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

        // Add location pages (city, district, subdistrict)
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

            // Add district page if available
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

                // Add subdistrict page if available
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

                // Add type + city + district pages
                if (item.workshopTypes && Array.isArray(item.workshopTypes) && item.workshopTypes.length > 0) {
                  const workshopType = item.workshopTypes[0];
                  if (workshopType?.id && workshopType?.name) {
                    const typeSlug = createSlug(workshopType.name);
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

            // Add type + city pages
            if (item.workshopTypes && Array.isArray(item.workshopTypes) && item.workshopTypes.length > 0) {
              const workshopType = item.workshopTypes[0];
              if (workshopType?.id && workshopType?.name) {
                const typeSlug = createSlug(workshopType.name);
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
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Abaikan error agar sitemap tetap ter-generate minimal untuk halaman utama
  }

  // Tambahkan pain points ke sitemap
  try {
    const token = await getServiceTokenWithRefresh();
    const painPointsRes = await fetch(`${apiBase}/pain-points?isActive=true&limit=1000`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (painPointsRes.ok) {
      const painPointsData = (await painPointsRes.json()) as {
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
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error generating pain points sitemap:', error);
    // Abaikan error agar sitemap tetap ter-generate
  }

  return routes;
}


