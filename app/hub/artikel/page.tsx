'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useArticles } from '@/queryHooks/useArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ShareButton } from '@/components/ui/share-button';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Calendar,
  ArrowRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Home,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800 border-red-200',
  GENERAL: 'bg-blue-100 text-blue-800 border-blue-200',
  MAINTENANCE: 'bg-green-100 text-green-800 border-green-200',
  BODYWORK: 'bg-purple-100 text-purple-800 border-purple-200',
  ELECTRICAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  STEER: 'bg-orange-100 text-orange-800 border-orange-200',
  SUSPENSION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const CATEGORY_LABELS: Record<string, string> = {
  URGENT: 'Urgent',
  GENERAL: 'Umum',
  MAINTENANCE: 'Perawatan',
  BODYWORK: 'Body',
  ELECTRICAL: 'Kelistrikan',
  STEER: 'Setir',
  SUSPENSION: 'Suspensi',
};

type SortOption = 'date-desc' | 'date-asc' | 'views-desc' | 'views-asc' | 'title-asc' | 'title-desc';

export default function HubArtikelPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

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

  // Filter articles by search query and category
  const filteredArticles = articles.filter((article) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        article.title?.toLowerCase().includes(query) ||
        article.metaDescription?.toLowerCase().includes(query) ||
        article.painPoint?.title?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory) {
      if (article.painPoint?.category !== selectedCategory) return false;
    }

    return true;
  });

  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortOption) {
      case 'date-desc':
        return (
          new Date(b.publishedAt || b.generatedAt).getTime() -
          new Date(a.publishedAt || a.generatedAt).getTime()
        );
      case 'date-asc':
        return (
          new Date(a.publishedAt || a.generatedAt).getTime() -
          new Date(b.publishedAt || b.generatedAt).getTime()
        );
      case 'views-desc':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'views-asc':
        return (a.viewCount || 0) - (b.viewCount || 0);
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '', 'id');
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '', 'id');
      default:
        return 0;
    }
  });

  // Paginate sorted articles
  const totalRecords = sortedArticles.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedArticles = sortedArticles.slice(startIndex, startIndex + pageSize);

  // Get unique categories from articles
  const availableCategories = Array.from(
    new Set(articles.map((a) => a.painPoint?.category).filter(Boolean) as string[]),
  );

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="h-4 w-4" />
          <span>Beranda</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/hub/artikel" className="text-foreground font-medium">
          Hub Artikel
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Hub Artikel & Panduan</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Temukan panduan lengkap untuk mengatasi berbagai masalah kendaraan Anda. 
          Dilengkapi dengan estimasi biaya dan rekomendasi bengkel terpercaya.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari artikel (contoh: AC tidak dingin, perawatan mobil)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setPage(1);
              }}
            >
              Semua
            </Button>
            {availableCategories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
              >
                {CATEGORY_LABELS[cat] || cat}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-muted-foreground whitespace-nowrap">
              Urutkan:
            </label>
            <Select
              value={sortOption}
              onValueChange={(value) => {
                setSortOption(value as SortOption);
                setPage(1);
              }}
            >
              <SelectTrigger
                id="sort-select"
                className="w-[200px] h-9 text-sm"
                icon={<ArrowUpDown className="h-4 w-4" />}
              >
                <SelectValue>
                  {sortOption === 'date-desc' && (
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      <span>Terbaru</span>
                    </div>
                  )}
                  {sortOption === 'date-asc' && (
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      <span>Terlama</span>
                    </div>
                  )}
                  {sortOption === 'views-desc' && (
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      <span>Paling Banyak Dilihat</span>
                    </div>
                  )}
                  {sortOption === 'views-asc' && (
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      <span>Paling Sedikit Dilihat</span>
                    </div>
                  )}
                  {sortOption === 'title-asc' && (
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      <span>Judul A-Z</span>
                    </div>
                  )}
                  {sortOption === 'title-desc' && (
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      <span>Judul Z-A</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    <span>Terbaru</span>
                  </div>
                </SelectItem>
                <SelectItem value="date-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    <span>Terlama</span>
                  </div>
                </SelectItem>
                <SelectItem value="views-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    <span>Paling Banyak Dilihat</span>
                  </div>
                </SelectItem>
                <SelectItem value="views-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    <span>Paling Sedikit Dilihat</span>
                  </div>
                </SelectItem>
                <SelectItem value="title-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    <span>Judul A-Z</span>
                  </div>
                </SelectItem>
                <SelectItem value="title-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    <span>Judul Z-A</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-4 text-sm text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{paginatedArticles.length}</span> dari{' '}
          <span className="font-semibold text-foreground">{totalRecords}</span> artikel
        </div>
      )}

      {/* Articles Grid */}
      {paginatedArticles.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">
            {searchQuery || selectedCategory
              ? 'Tidak ada artikel yang sesuai dengan filter. Coba ubah kata kunci atau kategori.'
              : 'Belum ada artikel tersedia'}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {paginatedArticles.map((article) => {
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
                          className={`mb-3 ${
                            CATEGORY_COLORS[article.painPoint.category] || 'bg-gray-100'
                          }`}
                        >
                          {CATEGORY_LABELS[article.painPoint.category] || article.painPoint.category}
                        </Badge>
                      )}

                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h2>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.metaDescription}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(article.publishedAt || article.generatedAt).toLocaleDateString('id-ID', {
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
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              pageSizeOptions={[12, 24, 36]}
            />
          )}
        </>
      )}
    </main>
  );
}


