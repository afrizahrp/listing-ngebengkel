'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { sysApi, extractErrorMessage } from '@/config/api';
import { SYS_ENDPOINTS } from '@/config/endpoints';

export interface WorkshopVideo {
  id: string;
  waitingListId: string;
  branchId: string | null;
  videoURL: string;
  thumbnailURL: string | null;
  title: string | null;
  description: string | null;
  duration: number | null;
  isPrimary: boolean;
  seq: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type WorkshopVideosQueryOptions = Omit<
  UseQueryOptions<WorkshopVideo[], Error>,
  'queryKey' | 'queryFn'
>;

export const useWorkshopVideos = (
  waitingListId?: string | null,
  branchId?: string | null,
  options?: WorkshopVideosQueryOptions,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<WorkshopVideo[], Error>({
    queryKey: ['workshop-videos', waitingListId, branchId],
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
        const url = `${SYS_ENDPOINTS.videos.base}${queryString ? `?${queryString}` : ''}`;

        const { data } = await sysApi.get<WorkshopVideo[]>(url);
        const videos = Array.isArray(data) ? data : [];
        // Filter hanya yang aktif (safety check, backend sudah filter)
        return videos.filter((video) => video.isActive !== false);
      } catch (error) {
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat videos bengkel.'),
        );
      }
    },
    ...restOptions,
  });
};

