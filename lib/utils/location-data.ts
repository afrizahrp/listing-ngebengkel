import { getServiceTokenWithRefresh } from './service-token-manager';

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

export interface LocationData {
  id: string;
  name: string;
}

/**
 * Get province data by ID or name
 */
export async function getProvinceData(idOrName: string): Promise<LocationData | null> {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/sys_province/${encodeURIComponent(idOrName)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const province = data?.data || data;
      if (province && (province.id || province.name)) {
        return {
          id: province.id || idOrName,
          name: province.name || idOrName,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching province data:', error);
    return null;
  }
}

/**
 * Get city data by ID or name
 */
export async function getCityData(idOrName: string): Promise<LocationData | null> {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/sys_city/${encodeURIComponent(idOrName)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const city = data?.data || data;
      if (city && (city.id || city.name)) {
        return {
          id: city.id || idOrName,
          name: city.name || idOrName,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching city data:', error);
    return null;
  }
}

/**
 * Get district data by ID or name
 */
export async function getDistrictData(idOrName: string): Promise<LocationData | null> {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/sys_district/${encodeURIComponent(idOrName)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const district = data?.data || data;
      if (district && (district.id || district.name)) {
        return {
          id: district.id || idOrName,
          name: district.name || idOrName,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching district data:', error);
    return null;
  }
}

/**
 * Get subdistrict data by ID or name
 */
export async function getSubdistrictData(idOrName: string): Promise<LocationData | null> {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/sys_subdistrict/${encodeURIComponent(idOrName)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const subdistrict = data?.data || data;
      if (subdistrict && (subdistrict.id || subdistrict.name)) {
        return {
          id: subdistrict.id || idOrName,
          name: subdistrict.name || idOrName,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching subdistrict data:', error);
    return null;
  }
}

/**
 * Get all workshops filtered by location
 */
export async function getWorkshopsByLocation(filters: {
  province?: string;
  city?: string;
  district?: string;
  subdistrict?: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any[]> {
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
      const data = await res.json().catch(() => ({}));
      const items = Array.isArray(data) ? data : (data?.data || []);
      
      // Filter by location IDs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return items.filter((item: any) => {
        if (filters.subdistrict && item.subdistrict?.trim() !== filters.subdistrict.trim()) {
          return false;
        }
        if (filters.district && item.district?.trim() !== filters.district.trim()) {
          return false;
        }
        if (filters.city && item.city?.trim() !== filters.city.trim()) {
          return false;
        }
        if (filters.province && item.province?.trim() !== filters.province.trim()) {
          return false;
        }
        return true;
      });
    }

    return [];
  } catch (error) {
    console.error('Error fetching workshops by location:', error);
    return [];
  }
}

