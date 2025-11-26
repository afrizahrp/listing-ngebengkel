import { getServiceTokenWithRefresh } from './service-token-manager';
import { createSlug } from './slug';

// For server-side calls, use BACKEND_URL only (not NEXT_PUBLIC_API_URL)
// NEXT_PUBLIC_API_URL is for client-side direct calls, which we want to avoid
const base = process.env.BACKEND_URL || 'http://127.0.0.1:4000';
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
    // Trim ID to remove any trailing spaces
    const trimmedId = idOrName.trim();
    if (!trimmedId) return null;
    
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/sys_province/${encodeURIComponent(trimmedId)}`, {
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
          id: province.id || trimmedId,
          name: province.name || trimmedId,
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
    // Trim ID to remove any trailing spaces
    const trimmedId = idOrName.trim();
    if (!trimmedId) return null;
    
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/sys_city/${encodeURIComponent(trimmedId)}`, {
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
          id: city.id || trimmedId,
          name: city.name || trimmedId,
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
    // Trim ID to remove any trailing spaces
    const trimmedId = idOrName.trim();
    if (!trimmedId) return null;
    
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/sys_district/${encodeURIComponent(trimmedId)}`, {
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
          id: district.id || trimmedId,
          name: district.name || trimmedId,
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
    // Trim ID to remove any trailing spaces
    const trimmedId = idOrName.trim();
    if (!trimmedId) return null;
    
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/sys_subdistrict/${encodeURIComponent(trimmedId)}`, {
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
          id: subdistrict.id || trimmedId,
          name: subdistrict.name || trimmedId,
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
 * Get workshop type data by ID or name
 */
export async function getWorkshopTypeData(idOrName: string): Promise<LocationData | null> {
  try {
    const trimmedId = idOrName.trim();
    if (!trimmedId) return null;
    
    const token = await getServiceTokenWithRefresh();
    // Get all categories first, then find type in their types array
    const res = await fetch(`${apiBase}/waiting-list/categories`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const categories = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      
      // Search for type in all categories
      // Try exact match first, then partial match
      const normalizedInput = trimmedId.toLowerCase();
      
      for (const category of categories) {
        if (Array.isArray(category.types)) {
          // First try: exact match (ID, name, or slug)
          let type = category.types.find((t: { id?: string; name?: string }) => 
            t.id?.trim() === trimmedId || 
            t.name?.toLowerCase().trim() === normalizedInput ||
            createSlug(t.name || '').toLowerCase() === normalizedInput
          );
          
          // Second try: partial match (if exact match not found)
          // Check if input is contained in type name or slug
          if (!type) {
            type = category.types.find((t: { id?: string; name?: string }) => {
              if (!t.name) return false;
              const typeNameLower = t.name.toLowerCase();
              const typeSlug = createSlug(t.name).toLowerCase();
              
              // Check if input matches part of type name or slug
              return typeNameLower.includes(normalizedInput) || 
                     typeSlug.includes(normalizedInput) ||
                     normalizedInput.includes(typeNameLower) ||
                     normalizedInput.includes(typeSlug);
            });
          }
          
          if (type) {
            return {
              id: type.id || trimmedId,
              name: type.name || trimmedId,
            };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching workshop type data:', error);
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

/**
 * Get all workshops filtered by type and location
 */
export async function getWorkshopsByTypeAndLocation(filters: {
  typeId?: string;
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
      
      // Filter by type and location IDs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return items.filter((item: any) => {
        // Filter by type
        if (filters.typeId) {
          const workshopTypes = item.workshopTypes || [];
          const hasType = workshopTypes.some((t: { id?: string }) => 
            t.id?.trim() === filters.typeId?.trim()
          );
          if (!hasType) return false;
        }
        
        // Filter by location
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
    console.error('Error fetching workshops by type and location:', error);
    return [];
  }
}

