'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 menit - data dianggap fresh selama 5 menit
            gcTime: 1000 * 60 * 30, // 30 menit - data tetap di cache selama 30 menit
            refetchOnWindowFocus: false, // Jangan refetch saat window focus
            refetchOnMount: true, // Refetch saat mount jika data stale
            refetchOnReconnect: true, // Refetch saat reconnect
            retry: 2, // Retry maksimal 2 kali secara default
            retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000), // Exponential backoff
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}


