'use client';

import { useCallback, useState } from 'react';

import { sysApi, extractErrorMessage } from '../config/api';
import { SYS_ENDPOINTS } from '../config/endpoints';
import type { SysSubDistrict } from '../lib/types/types';

type FetchSubDistrictsOptions = {
  districtId?: string;
  cityId?: string;
};

type UseSysSubDistrictReturn = {
  subdistricts: SysSubDistrict[];
  subdistrict: SysSubDistrict | null;
  loading: boolean;
  error: string | null;
  fetchSubDistricts: (options?: FetchSubDistrictsOptions) => Promise<SysSubDistrict[]>;
  fetchSubDistrictById: (id: string) => Promise<SysSubDistrict>;
  resetSubDistrictState: () => void;
};

export const useSysSubDistrict = (): UseSysSubDistrictReturn => {
  const [subdistricts, setSubDistricts] = useState<SysSubDistrict[]>([]);
  const [subdistrict, setSubDistrict] = useState<SysSubDistrict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubDistricts = useCallback(async (options?: FetchSubDistrictsOptions) => {
    setLoading(true);
    setError(null);

    try {
      let endpoint: string = SYS_ENDPOINTS.subdistrict.base;
      const districtId = options?.districtId;
      const cityId = options?.cityId;

      if (districtId !== undefined) {
        if (!districtId) {
          const message = 'ID kecamatan wajib diisi ketika menggunakan filter districtId.';
          setError(message);
          throw new Error(message);
        }
        endpoint = SYS_ENDPOINTS.subdistrict.byDistrict(districtId);
      } else if (cityId !== undefined) {
        if (!cityId) {
          const message = 'ID kota wajib diisi ketika menggunakan filter cityId.';
          setError(message);
          throw new Error(message);
        }
        endpoint = SYS_ENDPOINTS.subdistrict.byCity(cityId);
      }

      const { data } = await sysApi.get<SysSubDistrict[]>(endpoint);
      setSubDistricts(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat data kelurahan.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubDistrictById = useCallback(async (id: string) => {
    if (!id) {
      const message = 'ID kelurahan wajib diisi.';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await sysApi.get<SysSubDistrict>(SYS_ENDPOINTS.subdistrict.byId(id));
      setSubDistrict(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat detail kelurahan.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSubDistrictState = useCallback(() => {
    setSubDistricts([]);
    setSubDistrict(null);
    setError(null);
  }, []);

  return {
    subdistricts,
    subdistrict,
    loading,
    error,
    fetchSubDistricts,
    fetchSubDistrictById,
    resetSubDistrictState,
  };
};

