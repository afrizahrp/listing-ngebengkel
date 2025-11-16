'use client';

import { useCallback, useState } from 'react';

import { sysApi, extractErrorMessage } from '../config/api';
import { SYS_ENDPOINTS } from '../config/endpoints';
import type { SysCity } from '../lib/types/types';

type FetchCitiesOptions = {
  provinceId?: string;
};

type UseSysCityReturn = {
  cities: SysCity[];
  city: SysCity | null;
  loading: boolean;
  error: string | null;
  fetchCities: (options?: FetchCitiesOptions) => Promise<SysCity[]>;
  fetchCityById: (id: string) => Promise<SysCity>;
  resetCityState: () => void;
};

export const useSysCity = (): UseSysCityReturn => {
  const [cities, setCities] = useState<SysCity[]>([]);
  const [city, setCity] = useState<SysCity | null>(null);
const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async (options?: FetchCitiesOptions) => {
    setLoading(true);
    setError(null);

    try {
      let endpoint: string = SYS_ENDPOINTS.city.base;
      const provinceId = options?.provinceId;

      if (provinceId !== undefined) {
        if (!provinceId) {
          const message = 'ID provinsi wajib diisi ketika menggunakan filter provinceId.';
          setError(message);
          throw new Error(message);
        }
        endpoint = SYS_ENDPOINTS.city.byProvince(provinceId);
      }

      const { data } = await sysApi.get<SysCity[]>(endpoint);
      setCities(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat data kota/kabupaten.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCityById = useCallback(async (id: string) => {
    if (!id) {
      const message = 'ID kota wajib diisi.';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await sysApi.get<SysCity>(SYS_ENDPOINTS.city.byId(id));
      setCity(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat detail kota.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetCityState = useCallback(() => {
    setCities([]);
    setCity(null);
    setError(null);
  }, []);

  return {
    cities,
    city,
    loading,
    error,
    fetchCities,
    fetchCityById,
    resetCityState,
  };
};

