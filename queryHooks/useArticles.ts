'use client';

import { useCallback, useState } from 'react';
import { sysApi, extractErrorMessage } from '../config/api';
import { SYS_ENDPOINTS } from '../config/endpoints';

interface Article {
  id: string;
  slug: string;
  painPoint_id: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: any;
  imageUrl: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  generatedAt: string;
  publishedAt: string | null;
  painPoint?: {
    id: string;
    slug: string;
    title: string;
    category: string;
  };
}

interface ArticleListResponse {
  success: boolean;
  data: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface RecommendedWorkshop {
  id: string;
  name: string;
  slug: string;
  address: string;
  logo: string | null;
  city: string;
  isDemo: boolean;
  rating: number;
  phone: string;
  mobile: string;
}

type UseArticlesReturn = {
  articles: Article[];
  article: Article | null;
  workshops: RecommendedWorkshop[];
  loading: boolean;
  error: string | null;
  fetchArticles: (params?: { page?: number; limit?: number; status?: 'PUBLISHED' }) => Promise<ArticleListResponse>;
  fetchArticleBySlug: (slug: string) => Promise<Article>;
  fetchRecommendedWorkshops: (articleId: string) => Promise<RecommendedWorkshop[]>;
  resetArticleState: () => void;
};

export const useArticles = (): UseArticlesReturn => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [workshops, setWorkshops] = useState<RecommendedWorkshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async (params?: { page?: number; limit?: number; status?: 'PUBLISHED' }) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await sysApi.get<ArticleListResponse>(SYS_ENDPOINTS.articles.base, { params });
      setArticles(data.data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat data artikel.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArticleBySlug = useCallback(async (slug: string) => {
    if (!slug) {
      const message = 'Slug artikel wajib diisi.';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await sysApi.get<Article>(SYS_ENDPOINTS.articles.bySlug(slug));
      setArticle(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat detail artikel.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendedWorkshops = useCallback(async (articleId: string) => {
    if (!articleId) {
      const message = 'ID artikel wajib diisi.';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await sysApi.get<RecommendedWorkshop[]>(SYS_ENDPOINTS.articles.recommendedWorkshops(articleId));
      setWorkshops(data);
      return data;
    } catch (err) {
      const message = extractErrorMessage(err, 'Gagal memuat rekomendasi bengkel.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetArticleState = useCallback(() => {
    setArticles([]);
    setArticle(null);
    setWorkshops([]);
    setError(null);
  }, []);

  return {
    articles,
    article,
    workshops,
    loading,
    error,
    fetchArticles,
    fetchArticleBySlug,
    fetchRecommendedWorkshops,
    resetArticleState,
  };
};
