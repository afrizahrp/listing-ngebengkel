'use client';

import { useMemo } from 'react';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
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
        // Handle 429 (rate limiting) dengan lebih baik
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn(`Rate limited when fetching city name for ${cityId}`);
          // Return null untuk 429, jangan throw error
          return null;
        }
        console.warn(`Failed to fetch city name for ${cityId}:`, error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: (failureCount, error) => {
      // Jangan retry untuk 429 atau 404
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404 || status === 429) return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
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
        // Handle 429 (rate limiting) dengan lebih baik
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn(`Rate limited when fetching province name for ${provinceId}`);
          return null;
        }
        console.warn(`Failed to fetch province name for ${provinceId}:`, error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: (failureCount, error) => {
      // Jangan retry untuk 429 atau 404
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404 || status === 429) return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
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
        // Handle 429 (rate limiting) dengan lebih baik
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn(`Rate limited when fetching district name for ${districtId}`);
          return null;
        }
        console.warn(`Failed to fetch district name for ${districtId}:`, error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: (failureCount, error) => {
      // Jangan retry untuk 429 atau 404
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404 || status === 429) return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
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
        // Handle 429 (rate limiting) dengan lebih baik
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn(`Rate limited when fetching subdistrict name for ${subdistrictId}`);
          return null;
        }
        console.warn(`Failed to fetch subdistrict name for ${subdistrictId}:`, error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: (failureCount, error) => {
      // Jangan retry untuk 429 atau 404
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404 || status === 429) return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000),
    ...options,
  });
};

// Hook untuk fetch multiple district names using batch endpoint dengan React Query caching
export const useDistrictNamesBatch = (
  districtIds: string[],
  options?: Omit<UseQueryOptions<Record<string, string>, Error>, 'queryKey' | 'queryFn'>,
) => {
  // Sort and stringify IDs for consistent cache key
  const sortedIds = useMemo(() => [...districtIds].sort().join(','), [districtIds]);
  
  return useQuery<Record<string, string>, Error>({
    queryKey: ['district-names-batch', sortedIds],
    enabled: districtIds.length > 0,
    queryFn: async () => {
      if (districtIds.length === 0) return {};

      try {
        const res = await fetch('/api/sys_district/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: districtIds }),
          cache: 'no-store',
        });

        if (!res.ok) {
          console.warn(`Failed to fetch districts batch: ${res.status}`);
          return {};
        }

        const data = (await res.json().catch(() => ({}))) as LocationNamesResponse;
        const districts = Array.isArray(data) 
          ? data 
          : 'data' in data && Array.isArray(data.data)
            ? data.data
            : [];

        const districtMap: Record<string, string> = {};
        for (const district of districts) {
          const id = district?.id?.trim();
          const name = district?.name?.trim();
          if (id && name && name !== id) {
            districtMap[id] = name;
          }
        }
        return districtMap;
      } catch (error) {
        console.warn('Failed to fetch districts batch:', error);
        return {};
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: false, // Don't retry for batch requests
    ...options,
  });
};

// Hook untuk fetch multiple subdistrict names using batch endpoint dengan React Query caching
export const useSubdistrictNamesBatch = (
  subdistrictIds: string[],
  options?: Omit<UseQueryOptions<Record<string, string>, Error>, 'queryKey' | 'queryFn'>,
) => {
  // Sort and stringify IDs for consistent cache key
  const sortedIds = useMemo(() => [...subdistrictIds].sort().join(','), [subdistrictIds]);
  
  return useQuery<Record<string, string>, Error>({
    queryKey: ['subdistrict-names-batch', sortedIds],
    enabled: subdistrictIds.length > 0,
    queryFn: async () => {
      if (subdistrictIds.length === 0) return {};

      try {
        const res = await fetch('/api/sys_subdistrict/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: subdistrictIds }),
          cache: 'no-store',
        });

        if (!res.ok) {
          console.warn(`Failed to fetch subdistricts batch: ${res.status}`);
          return {};
        }

        const data = (await res.json().catch(() => ({}))) as LocationNamesResponse;
        const subdistricts = Array.isArray(data) 
          ? data 
          : 'data' in data && Array.isArray(data.data)
            ? data.data
            : [];

        const subdistrictMap: Record<string, string> = {};
        for (const subdistrict of subdistricts) {
          const id = subdistrict?.id?.trim();
          const name = subdistrict?.name?.trim();
          if (id && name && name !== id) {
            subdistrictMap[id] = name;
          }
        }
        return subdistrictMap;
      } catch (error) {
        console.warn('Failed to fetch subdistricts batch:', error);
        return {};
      }
    },
    staleTime: 1000 * 60 * 60, // Cache untuk 1 jam
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache untuk 24 jam
    retry: false, // Don't retry for batch requests
    ...options,
  });
};





