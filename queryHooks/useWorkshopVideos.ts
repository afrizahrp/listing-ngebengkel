'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
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
        // Handle 404 dan 429 errors dengan lebih baik
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 404) {
            // Return empty array untuk 404, bukan error
            return [];
          }
          if (status === 429) {
            throw new Error('Terlalu banyak permintaan. Silakan coba lagi nanti.');
          }
        }
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat videos bengkel.'),
        );
      }
    },
    staleTime: 1000 * 60 * 5, // Cache untuk 5 menit
    gcTime: 1000 * 60 * 30, // Keep in cache untuk 30 menit
    retry: (failureCount, error) => {
      // Jangan retry untuk 404, retry untuk 429 dengan limit
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) return false;
        if (status === 429) return failureCount < 2;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex, error) => {
      // Exponential backoff dengan jitter untuk 429
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        return Math.min(1000 * Math.pow(2, attemptIndex) + Math.random() * 1000, 10000);
      }
      return Math.min(1000 * Math.pow(2, attemptIndex), 5000);
    },
    ...restOptions,
  });
};

