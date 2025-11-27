'use client';

import { useMutation } from '@tanstack/react-query';
import { sysApi, extractErrorMessage } from '@/config/api';

type ResendOtpPayload = {
  waitingListId: string;
  claimRequestId: string;
};

type ResendOtpResponse = {
  message: string;
};

export const useResendOtp = () => {
  return useMutation<ResendOtpResponse, Error, ResendOtpPayload>({
    mutationFn: async ({ waitingListId, claimRequestId }) => {
      try {
        const trimmedId = waitingListId.trim();
        const { data } = await sysApi.post<ResendOtpResponse>(
          `/api/waiting-list/${encodeURIComponent(trimmedId)}/claim/resend`,
          {
            claimRequestId,
          },
        );
        return data;
      } catch (error) {
        throw new Error(
          extractErrorMessage(error, 'Gagal mengirim ulang kode OTP.'),
        );
      }
    },
  });
};

