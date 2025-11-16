'use client';

import { useCallback, useState } from 'react';

import { sysApi, extractErrorMessage } from '../config/api';
import { SYS_ENDPOINTS } from '../config/endpoints';
import type { SysDistrict } from '../lib/types/types';

type FetchDistrictsOptions = {
  cityId?: string;
};

type UseSysDistrictReturn = {
  districts: SysDistrict[];
  district: SysDistrict | null;
  loading: boolean;
  error: string | null;
  fetchDistricts: (options?: FetchDistrictsOptions) => Promise<SysDistrict[]>;
  fetchDistrictById: (id: string) => Promise<SysDistrict>;
  resetDistrictState: () => void;
};

export const useSysDistrict = (): UseSysDistrictReturn => {
  const [districts, setDistricts] = useState<SysDistrict[]>([]);
  const [district, setDistrict] = useState<SysDistrict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDistricts = useCallback(async (options?: FetchDistrictsOptions) => {
    setLoading(true);
    setError(null);

    try {
      let endpoint: string = SYS_ENDPOINTS.district.base;
      const cityId = options?.cityId;

      if (cityId !== undefined) {
        if (!cityId) {
          const message = 'ID kota wajib diisi ketika menggunakan filter cityId.';
          setError(message);
          throw new Error(message);
        }
        endpoint = SYS_ENDPOINTS.district.byCity(cityId);
      }

      const { data } = await sysApi.get<SysDistrict[]>(endpoint);
      setDistricts(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat data kecamatan.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDistrictById = useCallback(async (id: string) => {
    if (!id) {
      const message = 'ID kecamatan wajib diisi.';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await sysApi.get<SysDistrict>(SYS_ENDPOINTS.district.byId(id));
      setDistrict(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat detail kecamatan.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetDistrictState = useCallback(() => {
    setDistricts([]);
    setDistrict(null);
    setError(null);
  }, []);

  return {
    districts,
    district,
    loading,
    error,
    fetchDistricts,
    fetchDistrictById,
    resetDistrictState,
  };
};

