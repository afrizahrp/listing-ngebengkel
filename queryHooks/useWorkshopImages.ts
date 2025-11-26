'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { sysApi, extractErrorMessage } from '@/config/api';
import { SYS_ENDPOINTS } from '@/config/endpoints';

export interface WorkshopImage {
  id: string;
  waitingListId: string;
  branchId: string | null;
  imageURL: string;
  title: string | null;
  description: string | null;
  isPrimary: boolean;
  seq: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type WorkshopImagesQueryOptions = Omit<
  UseQueryOptions<WorkshopImage[], Error>,
  'queryKey' | 'queryFn'
>;

export const useWorkshopImages = (
  waitingListId?: string | null,
  branchId?: string | null,
  options?: WorkshopImagesQueryOptions,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<WorkshopImage[], Error>({
    queryKey: ['workshop-images', waitingListId, branchId],
    enabled: Boolean(waitingListId || branchId) && (enabled ?? true),
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        // Trim ID untuk menghilangkan spasi
        const trimmedWaitingListId = waitingListId?.trim();
        const trimmedBranchId = branchId?.trim();
        
        if (trimmedWaitingListId) params.append('waitingListId', trimmedWaitingListId);
        if (trimmedBranchId) params.append('branchId', trimmedBranchId);

        const queryString = params.toString();
        const url = `${SYS_ENDPOINTS.images.base}${queryString ? `?${queryString}` : ''}`;

        console.log('[useWorkshopImages] Fetching from:', url);
        console.log('[useWorkshopImages] WaitingListId (trimmed):', trimmedWaitingListId);
        const { data } = await sysApi.get<WorkshopImage[]>(url);
        console.log('[useWorkshopImages] Raw response:', data);
        
        // Handle different response formats
        let images: WorkshopImage[] = [];
        if (Array.isArray(data)) {
          images = data;
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          // Check if it's an object with 'data' property
          const dataObj = data as { data?: WorkshopImage[]; [key: string]: unknown };
          if ('data' in dataObj && Array.isArray(dataObj.data)) {
            images = dataObj.data;
          }
        }
        
        console.log('[useWorkshopImages] Parsed images:', images);
        
        // Filter hanya yang aktif (safety check, backend sudah filter)
        const activeImages = images.filter((img) => img.isActive !== false);
        console.log('[useWorkshopImages] Active images:', activeImages);
        
        return activeImages;
      } catch (error) {
        console.error('[useWorkshopImages] Error:', error);
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat images bengkel.'),
        );
      }
    },
    ...restOptions,
  });
};

