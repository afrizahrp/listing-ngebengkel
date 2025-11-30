'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';

import { sysApi, extractErrorMessage } from '@/config/api';
import { SYS_ENDPOINTS } from '@/config/endpoints';

// ============================================================================
// Types
// ============================================================================

export type PainPointCategory = 'URGENT' | 'GENERAL' | 'MAINTENANCE' | 'BODYWORK' | 'ELECTRICAL';

export type PainPoint = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: PainPointCategory;
  keywords: string[];
  iconName: string | null;
  imageUrl: string | null;
  popularityScore: number;
  viewCount: number;
  searchCount: number;
  isUrgent: boolean;
  priority: number;
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PainPointServiceType = {
  id: string;
  name: string;
  relevance: number;
};

export type PainPointWorkshopType = {
  id: string;
  name: string;
  relevance: number;
};

export type PainPointDetail = PainPoint & {
  serviceTypes?: PainPointServiceType[];
  workshopTypes?: PainPointWorkshopType[];
  branchCount?: number;
  relatedPainPoints?: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
  }>;
};

export type PainPointSearchResult = {
  painPoint: PainPoint;
  confidence: number;
  matchedKeywords: string[];
};

export type PainPointMatchResult = PainPointSearchResult & {
  serviceTypes?: PainPointServiceType[];
};

type PainPointListResponse = {
  message: string;
  data: PainPoint[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PainPointDetailResponse = {
  message: string;
  data: PainPointDetail;
};

type PainPointSearchResponse = {
  message: string;
  data: PainPointSearchResult[];
};

type PainPointListQueryOptions = Omit<
  UseQueryOptions<PainPointListResponse, Error>,
  'queryKey' | 'queryFn'
> & {
  category?: PainPointCategory;
  isPopular?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'popularity' | 'name';
  orderDir?: 'asc' | 'desc';
};

type PainPointDetailQueryOptions = Omit<
  UseQueryOptions<PainPointDetail, Error>,
  'queryKey' | 'queryFn'
>;

type PainPointSearchQueryOptions = Omit<
  UseQueryOptions<PainPointSearchResult[], Error>,
  'queryKey' | 'queryFn'
> & {
  q: string;
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook untuk mendapatkan list pain points dengan pagination, filtering, sorting
 */
export const usePainPoints = (options?: PainPointListQueryOptions) => {
  const {
    enabled,
    category,
    isPopular,
    isActive = true,
    search,
    page = 1,
    limit = 12,
    orderBy = 'popularity',
    orderDir = 'desc',
    ...restOptions
  } = options ?? {};

  return useQuery<PainPointListResponse, Error>({
    queryKey: [
      'pain-points',
      'list',
      category,
      isPopular,
      isActive,
      search,
      page,
      limit,
      orderBy,
      orderDir,
    ],
    enabled: enabled ?? true,
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (category) queryParams.set('category', category);
        if (isPopular !== undefined) queryParams.set('isPopular', String(isPopular));
        if (isActive !== undefined) queryParams.set('isActive', String(isActive));
        if (search) queryParams.set('search', search);
        queryParams.set('page', String(page));
        queryParams.set('limit', String(limit));
        if (orderBy) queryParams.set('orderBy', orderBy);
        if (orderDir) queryParams.set('orderDir', orderDir);

        const { data } = await sysApi.get<PainPointListResponse>(
          `${SYS_ENDPOINTS.painPoints.base}?${queryParams.toString()}`,
        );

        return data;
      } catch (error) {
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat daftar pain points.'),
        );
      }
    },
    staleTime: 1000 * 60 * 5, // Cache untuk 5 menit
    gcTime: 1000 * 60 * 30, // Keep in cache untuk 30 menit
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) return false;
        if (status === 429) return failureCount < 2;
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

/**
 * Hook untuk mendapatkan detail pain point berdasarkan slug
 */
export const usePainPoint = (
  slug: string | null,
  options?: PainPointDetailQueryOptions,
) => {
  const { enabled, ...restOptions } = options ?? {};

  return useQuery<PainPointDetail, Error>({
    queryKey: ['pain-points', 'detail', slug],
    enabled: Boolean(slug) && (enabled ?? true),
    queryFn: async () => {
      if (!slug) {
        throw new Error('Slug pain point wajib diisi.');
      }

      try {
        const { data } = await sysApi.get<PainPointDetailResponse>(
          SYS_ENDPOINTS.painPoints.bySlug(slug),
        );

        return data.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 404) {
            throw new Error('Pain point tidak ditemukan.');
          }
          if (status === 429) {
            throw new Error('Terlalu banyak permintaan. Silakan coba lagi nanti.');
          }
        }
        throw new Error(
          extractErrorMessage(error, 'Gagal memuat detail pain point.'),
        );
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) return false;
        if (status === 429) return failureCount < 2;
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

/**
 * Hook untuk search pain points dengan full-text search
 */
export const usePainPointSearch = (options?: PainPointSearchQueryOptions) => {
  const { enabled, q, ...restOptions } = options ?? {};

  return useQuery<PainPointSearchResult[], Error>({
    queryKey: ['pain-points', 'search', q],
    enabled: Boolean(q && q.trim().length > 0) && (enabled ?? true),
    queryFn: async () => {
      if (!q || q.trim().length === 0) {
        return [];
      }

      try {
        const { data } = await sysApi.get<PainPointSearchResponse>(
          `${SYS_ENDPOINTS.painPoints.base}/search?q=${encodeURIComponent(q.trim())}`,
        );

        return data.data;
      } catch (error) {
        throw new Error(
          extractErrorMessage(error, 'Gagal mencari pain points.'),
        );
      }
    },
    staleTime: 1000 * 60 * 2, // Cache lebih pendek untuk search
    gcTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) return false;
        if (status === 429) return failureCount < 2;
      }
      return failureCount < 2;
    },
    ...restOptions,
  });
};


