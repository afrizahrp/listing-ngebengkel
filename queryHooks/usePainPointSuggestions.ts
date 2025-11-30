'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

import { sysApi, extractErrorMessage } from '@/config/api';
import { SYS_ENDPOINTS } from '@/config/endpoints';
import type { PainPointSearchResult } from './usePainPoints';

type UsePainPointSuggestionsOptions = Omit<
  UseQueryOptions<PainPointSearchResult[], Error>,
  'queryKey' | 'queryFn'
> & {
  query: string;
  minLength?: number; // Minimum character length untuk trigger search
};

/**
 * Hook untuk mendapatkan suggestions berdasarkan query
 * Auto-disable jika query kurang dari minLength (default: 2)
 */
export const usePainPointSuggestions = (
  options?: UsePainPointSuggestionsOptions,
) => {
  const { enabled, query, minLength = 2, ...restOptions } = options ?? {};

  const trimmedQuery = query?.trim() || '';
  const shouldFetch = trimmedQuery.length >= minLength;

  return useQuery<PainPointSearchResult[], Error>({
    queryKey: ['pain-points', 'suggestions', trimmedQuery],
    enabled: shouldFetch && (enabled ?? true),
    queryFn: async () => {
      if (!trimmedQuery || trimmedQuery.length < minLength) {
        return [];
      }

      try {
        const { data } = await sysApi.get<{
          message: string;
          data: PainPointSearchResult[];
        }>(
          `${SYS_ENDPOINTS.painPoints.base}/search?q=${encodeURIComponent(trimmedQuery)}`,
        );

        // Limit to top 5 suggestions
        return data.data.slice(0, 5);
      } catch (error) {
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat suggestions.'),
        );
      }
    },
    staleTime: 1000 * 60 * 2, // Cache 2 menit untuk suggestions
    gcTime: 1000 * 60 * 10,
    retry: false, // Don't retry untuk suggestions (user experience)
    ...restOptions,
  });
};

/**
 * Helper hook untuk extract suggestions text dari search results
 */
export const usePainPointSuggestionsText = (
  options?: UsePainPointSuggestionsOptions,
) => {
  const { data, ...rest } = usePainPointSuggestions(options);

  const suggestions = useMemo(() => {
    if (!data) return [];
    return data.map((result) => result.painPoint.title);
  }, [data]);

  return {
    ...rest,
    data: suggestions,
    suggestions,
  };
};

