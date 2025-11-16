'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

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
  id: string | null,
  options?: WaitingListQueryOptions,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<WaitingListItem, Error>({
    queryKey: ['waiting-list', id],
    enabled: Boolean(id) && (enabled ?? true),
    queryFn: async () => {
      if (!id) {
        throw new Error('ID waiting list wajib diisi.');
      }

      try {
        const { data } = await sysApi.get<unknown>(
          SYS_ENDPOINTS.waitingList.byId(id),
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
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat data waiting list.'),
        );
      }
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