'use client';

import { useMutation } from '@tanstack/react-query';
import { sysApi, extractErrorMessage } from '@/config/api';

type ClaimWorkshopPayload = {
  phone: string;
  name: string;
  email?: string;
};

type ClaimWorkshopResponse = {
  message: string;
  claimToken?: string;
};

export const useClaimWorkshop = () => {
  return useMutation<ClaimWorkshopResponse, Error, { waitingListId: string } & ClaimWorkshopPayload>({
    mutationFn: async ({ waitingListId, ...payload }) => {
      try {
        // Trim ID untuk menghilangkan spasi
        const trimmedId = waitingListId.trim();
        const { data } = await sysApi.post<ClaimWorkshopResponse>(
          `/api/waiting-list/${encodeURIComponent(trimmedId)}/claim`,
          payload,
        );
        return data;
      } catch (error) {
        throw new Error(
          extractErrorMessage(error, 'Gagal mengklaim bengkel.'),
        );
      }
    },
  });
};

