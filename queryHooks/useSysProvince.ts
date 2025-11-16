'use client';

import { useCallback, useState } from 'react';

import { sysApi, extractErrorMessage } from '../config/api';
import { SYS_ENDPOINTS } from '../config/endpoints';
import type { SysProvince } from '../lib/types/types';

type UseSysProvinceReturn = {
  provinces: SysProvince[];
  province: SysProvince | null;
  loading: boolean;
  error: string | null;
  fetchProvinces: () => Promise<SysProvince[]>;
  fetchProvinceById: (id: string) => Promise<SysProvince>;
  resetProvinceState: () => void;
};

export const useSysProvince = (): UseSysProvinceReturn => {
  const [provinces, setProvinces] = useState<SysProvince[]>([]);
  const [province, setProvince] = useState<SysProvince | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProvinces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await sysApi.get<SysProvince[]>(SYS_ENDPOINTS.province.base);
      setProvinces(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat data provinsi.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProvinceById = useCallback(async (id: string) => {
    if (!id) {
      const message = 'ID provinsi wajib diisi.';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await sysApi.get<SysProvince>(SYS_ENDPOINTS.province.byId(id));
      setProvince(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat detail provinsi.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetProvinceState = useCallback(() => {
    setProvinces([]);
    setProvince(null);
    setError(null);
  }, []);

  return {
    provinces,
    province,
    loading,
    error,
    fetchProvinces,
    fetchProvinceById,
    resetProvinceState,
  };
};

