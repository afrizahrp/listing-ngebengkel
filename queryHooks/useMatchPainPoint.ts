'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import axios from 'axios';

import { sysApi, extractErrorMessage } from '@/config/api';
import { SYS_ENDPOINTS } from '@/config/endpoints';
import type { PainPointMatchResult } from './usePainPoints';

type UseMatchPainPointOptions = Omit<
  UseQueryOptions<PainPointMatchResult | null, Error>,
  'queryKey' | 'queryFn'
> & {
  query?: string;
  debounceMs?: number; // Debounce delay in milliseconds
  enabled?: boolean;
};

/**
 * Hook untuk match query ke pain point dengan debounce
 * 
 * Features:
 * - Auto-debounce query (default: 300ms)
 * - Returns best match dengan confidence score
 * - Auto-disable jika query kosong
 */
export const useMatchPainPoint = (options?: UseMatchPainPointOptions) => {
  const { enabled, query = '', debounceMs = 300, ...restOptions } = options ?? {};

  // Debounce query - pastikan debounce bekerja dengan benar
  const debouncedQuery = useDebounce(query || '', debounceMs);
  const trimmedQuery = debouncedQuery?.trim() || '';
  const shouldFetch = trimmedQuery.length > 0;

  return useQuery<PainPointMatchResult | null, Error>({
    queryKey: ['pain-points', 'match', trimmedQuery],
    enabled: shouldFetch && (enabled ?? true),
    queryFn: async () => {
      if (!trimmedQuery) {
        return null;
      }

      try {
        // Use search endpoint instead of match (match is internal)
        // Search will return best match as first result
        const { data } = await sysApi.get<{
          message: string;
          data: Array<{
            painPoint: {
              id: string;
              slug: string;
              title: string;
              category: string;
              keywords: string[];
              [key: string]: unknown;
            };
            confidence: number;
            matchedKeywords: string[];
          }>;
        }>(
          `${SYS_ENDPOINTS.painPoints.base}/search?q=${encodeURIComponent(trimmedQuery)}`,
        );

        // Validate response structure
        if (!data || !Array.isArray(data.data) || data.data.length === 0) {
          return null;
        }

        // Get best match (first result)
        const bestMatch = data.data[0];

        if (!bestMatch || !bestMatch.painPoint) {
          return null;
        }

        // Get detail untuk service types (optional, tidak wajib)
        if (bestMatch.painPoint.slug) {
          try {
            const detailResponse = await sysApi.get<{
              message: string;
              data: {
                serviceTypes?: Array<{ id: string; name: string; relevance: number }>;
              };
            }>(SYS_ENDPOINTS.painPoints.bySlug(bestMatch.painPoint.slug));

            // Safely access serviceTypes with optional chaining
            const serviceTypes = detailResponse?.data?.data?.serviceTypes;

            return {
              painPoint: bestMatch.painPoint,
              confidence: bestMatch.confidence,
              matchedKeywords: bestMatch.matchedKeywords || [],
              ...(serviceTypes && { serviceTypes }),
            } as PainPointMatchResult;
          } catch (error) {
            // If detail fetch fails, return without service types (not critical)
            // Log error in development only
            if (process.env.NODE_ENV === 'development') {
              console.warn('Failed to fetch pain point detail:', error);
            }
            return {
              painPoint: bestMatch.painPoint,
              confidence: bestMatch.confidence,
              matchedKeywords: bestMatch.matchedKeywords || [],
            } as PainPointMatchResult;
          }
        }

        return {
          painPoint: bestMatch.painPoint,
          confidence: bestMatch.confidence,
          matchedKeywords: bestMatch.matchedKeywords || [],
        } as PainPointMatchResult;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 404) {
            return null; // No match found, bukan error
          }
          if (status === 429) {
            throw new Error('Terlalu banyak permintaan. Silakan coba lagi nanti.');
          }
        }
        throw new Error(
          extractErrorMessage(error, 'Gagal melakukan matching pain point.'),
        );
      }
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) return false; // No match is not an error
        if (status === 429) return failureCount < 2;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * Math.pow(2, attemptIndex), 5000);
    },
    ...restOptions,
  });
};

