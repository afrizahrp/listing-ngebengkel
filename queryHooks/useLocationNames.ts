'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { sysApi, extractErrorMessage } from '@/config/api';

type LocationName = {
  id: string;
  name: string;
};

type LocationNamesResponse = {
  data?: LocationName[];
} | LocationName[];

// Hook untuk fetch city name by ID dengan React Query caching
export const useCityName = (
  cityId: string | null | undefined,
  options?: Omit<UseQueryOptions<string | null, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<string | null, Error>({
    queryKey: ['city-name', cityId],
    enabled: Boolean(cityId && cityId.trim()),
    queryFn: async () => {
      if (!cityId?.trim()) return null;

      try {
        // Coba batch endpoint dulu
        const batchRes = await fetch('/api/sys_city/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: [cityId.trim()] }),
          cache: 'no-store',
        });

        if (batchRes.ok) {
          const batchData = (await batchRes.json().catch(() => ({}))) as LocationNamesResponse;
          // Handle both response formats: { data: [...] } or [...]
          const cities = Array.isArray(batchData) 
            ? batchData 
            : 'data' in batchData && Array.isArray(batchData.data)
              ? batchData.data
              : [];
          const city = cities.find((c) => c?.id?.trim() === cityId.trim());
          if (city?.name?.trim() && city.name.trim() !== cityId.trim()) {
            return city.name.trim();
          }
        }

        // Fallback ke individual endpoint
        const { data } = await sysApi.get<LocationName>(`/api/sys_city/${encodeURIComponent(cityId.trim())}`);
        const name = data?.name?.trim();
        if (name && name !== cityId.trim()) {
          return name;
        }
        return null;
      } catch (error) {
        console.warn(`Failed to fetch city name for ${cityId}:`, error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};

// Hook untuk fetch province name by ID dengan React Query caching
export const useProvinceName = (
  provinceId: string | null | undefined,
  options?: Omit<UseQueryOptions<string | null, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<string | null, Error>({
    queryKey: ['province-name', provinceId],
    enabled: Boolean(provinceId && provinceId.trim()),
    queryFn: async () => {
      if (!provinceId?.trim()) return null;

      try {
        const { data } = await sysApi.get<LocationName>(`/api/sys_province/${encodeURIComponent(provinceId.trim())}`);
        const name = data?.name?.trim();
        if (name && name !== provinceId.trim()) {
          return name;
        }
        return null;
      } catch (error) {
        console.warn(`Failed to fetch province name for ${provinceId}:`, error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};

// Hook untuk fetch district name by ID dengan React Query caching
export const useDistrictName = (
  districtId: string | null | undefined,
  options?: Omit<UseQueryOptions<string | null, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<string | null, Error>({
    queryKey: ['district-name', districtId],
    enabled: Boolean(districtId && districtId.trim()),
    queryFn: async () => {
      if (!districtId?.trim()) return null;

      try {
        const { data } = await sysApi.get<LocationName>(`/api/sys_district/${encodeURIComponent(districtId.trim())}`);
        const name = data?.name?.trim();
        if (name && name !== districtId.trim()) {
          return name;
        }
        return null;
      } catch (error) {
        console.warn(`Failed to fetch district name for ${districtId}:`, error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};

// Hook untuk fetch subdistrict name by ID dengan React Query caching
export const useSubdistrictName = (
  subdistrictId: string | null | undefined,
  options?: Omit<UseQueryOptions<string | null, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<string | null, Error>({
    queryKey: ['subdistrict-name', subdistrictId],
    enabled: Boolean(subdistrictId && subdistrictId.trim()),
    queryFn: async () => {
      if (!subdistrictId?.trim()) return null;

      try {
        const { data } = await sysApi.get<LocationName>(`/api/sys_subdistrict/${encodeURIComponent(subdistrictId.trim())}`);
        const name = data?.name?.trim();
        if (name && name !== subdistrictId.trim()) {
          return name;
        }
        return null;
      } catch (error) {
        console.warn(`Failed to fetch subdistrict name for ${subdistrictId}:`, error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};


