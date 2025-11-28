'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';

import { sysApi, extractErrorMessage } from '@/config/api';
import { SYS_ENDPOINTS } from '@/config/endpoints';
import type { WaitingListItem } from '@/lib/types/waitingList';



type WaitingListQueryOptions = Omit<
  UseQueryOptions<WaitingListItem, Error>,
  'queryKey' | 'queryFn'
>;

type WaitingListListQueryOptions = Omit<
  UseQueryOptions<WaitingListItem[], Error>,
  'queryKey' | 'queryFn'
>;

export const useWaitingList = (
  slugOrId: string | null,
  options?: WaitingListQueryOptions,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<WaitingListItem, Error>({
    queryKey: ['waiting-list', slugOrId],
    enabled: Boolean(slugOrId) && (enabled ?? true),
    queryFn: async () => {
      if (!slugOrId) {
        throw new Error('Slug atau ID waiting list wajib diisi.');
      }

      try {
        // Coba dengan slug-based endpoint (jika ada) atau fallback ke byId
        // Untuk sekarang, kita akan cari berdasarkan slug di frontend
        // atau buat endpoint baru di API route
        const { data } = await sysApi.get<unknown>(
          `/api/waiting-list/${encodeURIComponent(slugOrId)}`,
        );
        const payload = data as any;
        // Terima dua bentuk: { message, data } atau object langsung
        const item: WaitingListItem | undefined =
          (payload?.data as WaitingListItem | undefined) ??
          (payload as WaitingListItem | undefined);
        if (!item) {
          throw new Error('Gagal memuat data waiting list.');
        }
        return item;
      } catch (error) {
        // Handle 404 dan 429 errors dengan lebih baik
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 404) {
            throw new Error('Data bengkel tidak ditemukan.');
          }
          if (status === 429) {
            throw new Error('Terlalu banyak permintaan. Silakan coba lagi nanti.');
          }
        }
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat data waiting list.'),
        );
      }
    },
    staleTime: 1000 * 60 * 5, // Cache untuk 5 menit
    gcTime: 1000 * 60 * 30, // Keep in cache untuk 30 menit
    retry: (failureCount, error) => {
      // Jangan retry untuk 404 (not found) atau 429 (rate limit)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) return false;
        if (status === 429) {
          // Retry untuk 429, tapi dengan delay yang lebih lama
          return failureCount < 2;
        }
      }
      // Retry maksimal 2 kali untuk error lainnya
      return failureCount < 2;
    },
    retryDelay: (attemptIndex, error) => {
      // Exponential backoff dengan jitter untuk 429
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        return Math.min(1000 * Math.pow(2, attemptIndex) + Math.random() * 1000, 10000);
      }
      // Delay normal untuk error lainnya
      return Math.min(1000 * Math.pow(2, attemptIndex), 5000);
    },
    ...restOptions,
  });
};

export const useWaitingLists = (options?: WaitingListListQueryOptions) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<WaitingListItem[], Error>({
    queryKey: ['waiting-list', 'all'],
    enabled: enabled ?? true,
    queryFn: async () => {
      try {
        const { data } = await sysApi.get<unknown>(
          SYS_ENDPOINTS.waitingList.base,
        );
        const payload = data as any;
        // Terima dua bentuk: { message, data: [] } atau array langsung
        const list: WaitingListItem[] =
          (Array.isArray(payload) ? payload : payload?.data) ?? [];
        return list;
      } catch (error) {
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat daftar waiting list.'),
        );
      }
    },
    ...restOptions,
  });
};