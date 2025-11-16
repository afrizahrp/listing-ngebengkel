'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { sysApi, extractErrorMessage } from '@/config/api';
import { SYS_ENDPOINTS } from '@/config/endpoints';
import type { WorkshopCategory } from '@/lib/types/workshop';

type WorkshopCategoryResponse = {
  message: string;
  data: WorkshopCategory[];
};

type UseWorkshopCategoriesOptions = Omit<
  UseQueryOptions<WorkshopCategory[], Error>,
  'queryKey' | 'queryFn'
>;

export const useWorkshopCategories = (
  options?: UseWorkshopCategoriesOptions,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<WorkshopCategory[], Error>({
    queryKey: ['workshop-categories'],
    enabled: enabled ?? true,
    queryFn: async () => {
      try {
        const { data } = await sysApi.get<WorkshopCategoryResponse>(
          SYS_ENDPOINTS.waitingList.categories,
        );

        return data.data;
      } catch (error) {
        throw new Error(
          extractErrorMessage(
            error,
            'Gagal memuat daftar kategori workshop.',
          ),
        );
      }
    },
    ...restOptions,
  });
};
