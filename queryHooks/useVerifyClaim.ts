'use client';

import { useMutation } from '@tanstack/react-query';
import { sysApi, extractErrorMessage } from '@/config/api';

type VerifyClaimPayload = {
  waitingListId: string;
  claimRequestId: string;
  verificationCode: string;
};

type VerifyClaimResponse = {
  message: string;
  waitingListId: string;
};

export const useVerifyClaim = () => {
  return useMutation<VerifyClaimResponse, Error, VerifyClaimPayload>({
    mutationFn: async ({ waitingListId, claimRequestId, verificationCode }) => {
      try {
        const trimmedId = waitingListId.trim();
        const { data } = await sysApi.post<VerifyClaimResponse>(
          `/api/waiting-list/${encodeURIComponent(trimmedId)}/claim/verify`,
          {
            claimRequestId,
            verificationCode,
          },
        );
        return data;
      } catch (error) {
        throw new Error(
          extractErrorMessage(error, 'Gagal memverifikasi kode OTP.'),
        );
      }
    },
  });
};



