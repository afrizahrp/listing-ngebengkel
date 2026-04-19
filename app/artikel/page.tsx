'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useArticles } from '@/queryHooks/useArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ShareButton } from '@/components/ui/share-button';
import { Eye, Calendar, ArrowRight } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800 border-red-200',
  GENERAL: 'bg-blue-100 text-blue-800 border-blue-200',
  MAINTENANCE: 'bg-green-100 text-green-800 border-green-200',
  BODYWORK: 'bg-purple-100 text-purple-800 border-purple-200',
  ELECTRICAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const { articles, loading, error, fetchArticles } = useArticles();

  useEffect(() => {
    fetchArticles({
      page,
      limit: pageSize,
      status: 'PUBLISHED',
    }).catch((err) => {
      console.error('Failed to fetch articles:', err);
    });
  }, [page, pageSize, fetchArticles]);

  // Calculate pagination info
  const totalPages = 1; // Will be updated when we have pagination info
  const totalRecords = articles.length;

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h1>
          <p className="text-gray-600">{error}</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Panduan & Solusi Masalah Kendaraan
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Temukan panduan lengkap untuk mengatasi berbagai masalah kendaraan kamu. Dilengkapi dengan
          estimasi biaya dan rekomendasi bengkel terpercaya.
        </p>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">Belum ada artikel tersedia</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {articles.map((article) => {
              const articleSlug = article.slug?.replace(/^seasonal-/, '') || article.slug;

              return (
                <Card
                  key={article.id}
                  className="h-full hover:shadow-xl transition-shadow duration-300 group flex flex-col"
                >
                  <Link href={`/artikel/${articleSlug}`} className="flex-1">
                    {/* Image */}
                    {article.imageUrl && (
                      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <CardContent className="p-6">
                      {/* Category Badge */}
                      {article.painPoint?.category && (
                        <Badge
                          className={`mb-3 ${CATEGORY_COLORS[article.painPoint.category] || 'bg-gray-100'}`}
                        >
                          {article.painPoint.category}
                        </Badge>
                      )}

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h2>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {article.metaDescription}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(
                              article.publishedAt || article.generatedAt,
                            ).toLocaleDateString('id-ID', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.viewCount || 0}</span>
                        </div>
                      </div>

                      {/* Read More */}
                      <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>

                  {/* Share Button */}
                  <div className="px-6 pb-4 border-t pt-4">
                    <ShareButton
                      url={`/artikel/${articleSlug}`}
                      title={article.title}
                      description={article.metaDescription}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[12, 24, 36]}
            />
          )}
        </>
      )}
    </main>
  );
}
