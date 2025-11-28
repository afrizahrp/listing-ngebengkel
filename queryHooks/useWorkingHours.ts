'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';

import { sysApi, extractErrorMessage } from '@/config/api';

export interface WorkingHour {
  id: string;
  waitingListId: string;
  branchId: string | null;
  companyId: string | null;
  weekday: number; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  bookingBufferMinutes: number | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

type WorkingHoursQueryOptions = Omit<
  UseQueryOptions<WorkingHour[], Error>,
  'queryKey' | 'queryFn'
> & {
  waitingListId?: string;
  branchId?: string;
  companyId?: string;
};

export const useWorkingHours = (options?: WorkingHoursQueryOptions) => {
  const { waitingListId, branchId, companyId, enabled, ...restOptions } = options ?? {};

  return useQuery<WorkingHour[], Error>({
    queryKey: ['workingHours', waitingListId, branchId, companyId],
    enabled: Boolean(waitingListId || branchId || companyId) && (enabled ?? true),
    queryFn: async () => {
      try {
        const params: Record<string, string> = {};
        if (waitingListId) params.waitingListId = waitingListId;
        if (branchId) params.branchId = branchId;
        if (companyId) params.companyId = companyId;

        const { data } = await sysApi.get<unknown>(
          '/api/wks/working-hours',
          { params },
        );

        // Handle response format: array langsung atau { data: [] }
        const payload = data as any;
        const workingHours: WorkingHour[] = Array.isArray(payload)
          ? payload
          : payload?.data ?? [];

        return workingHours;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 404) {
            return []; // Return empty array jika tidak ditemukan
          }
          if (status === 429) {
            throw new Error('Terlalu banyak permintaan. Silakan coba lagi nanti.');
          }
        }
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat jam kerja.'),
        );
      }
    },
    staleTime: 1000 * 60 * 5, // Cache untuk 5 menit
    gcTime: 1000 * 60 * 30, // Keep in cache untuk 30 menit
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) return false;
        if (status === 429) {
          return failureCount < 2;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        return Math.min(1000 * Math.pow(2, attemptIndex) + Math.random() * 1000, 10000);
      }
      return Math.min(1000 * Math.pow(2, attemptIndex), 5000);
    },
    ...restOptions,
  });
};

