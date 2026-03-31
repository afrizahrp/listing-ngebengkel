'use client';

import { usePainPoints } from '@/queryHooks/usePainPoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Car,
  Lightbulb,
  AlertTriangle,
  Circle,
  Settings,
  Loader2,
  Search,
  SquareParkingIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Home,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  URGENT: AlertTriangle,
  GENERAL: Wrench,
  MAINTENANCE: Settings,
  BODYWORK: Car,
  ELECTRICAL: Lightbulb,
  STEER: Circle,
  SUSPENSION: SquareParkingIcon,
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

type SortOption = 'popularity-desc' | 'popularity-asc' | 'name-asc' | 'name-desc';

export default function HubMasalahPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortOption, setSortOption] = useState<SortOption>('popularity-desc');

  // Parse sort option
  const orderBy = sortOption.startsWith('popularity') ? 'popularity' : 'name';
  const orderDir = sortOption.includes('desc') ? 'desc' : 'asc';

  const { data: painPointsData, isLoading } = usePainPoints({
    isActive: true,
    category: (selectedCategory as 'URGENT' | 'GENERAL' | 'MAINTENANCE' | 'BODYWORK' | 'ELECTRICAL') || undefined,
    search: searchQuery || undefined,
    page,
    limit: pageSize,
    orderBy,
    orderDir,
  });

  const handlePainPointClick = (slug: string) => {
    router.push(`/masalah/${slug}`);
  };

  const categories = ['URGENT', 'GENERAL', 'MAINTENANCE', 'BODYWORK', 'ELECTRICAL', 'STEER', 'SUSPENSION'];

  const totalRecords = painPointsData?.total || 0;
  const totalPages = painPointsData?.totalPages || 1;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="h-4 w-4" />
          <span>Beranda</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/hub/masalah" className="text-foreground font-medium">
          Hub Masalah
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Hub Masalah Kendaraan</h1>
        <p className="text-muted-foreground text-lg">
          Pilih masalah kendaraan yang Kamu alami untuk menemukan bengkel terpercaya
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari masalah kendaraan (contoh: AC tidak dingin, rem blong)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to page 1 on search
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
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
              >
                {CATEGORY_LABELS[cat]}
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
                  {sortOption === 'popularity-desc' && (
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      <span>Populer</span>
                    </div>
                  )}
                  {sortOption === 'popularity-asc' && (
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      <span>Kurang Populer</span>
                    </div>
                  )}
                  {sortOption === 'name-asc' && (
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      <span>Nama A-Z</span>
                    </div>
                  )}
                  {sortOption === 'name-desc' && (
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      <span>Nama Z-A</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    <span>Populer</span>
                  </div>
                </SelectItem>
                <SelectItem value="popularity-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    <span>Kurang Populer</span>
                  </div>
                </SelectItem>
                <SelectItem value="name-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    <span>Nama A-Z</span>
                  </div>
                </SelectItem>
                <SelectItem value="name-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    <span>Nama Z-A</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && painPointsData && (
        <div className="mb-4 text-sm text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{painPointsData.data.length}</span> dari{' '}
          <span className="font-semibold text-foreground">{totalRecords}</span> masalah
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {painPointsData?.data && painPointsData.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {painPointsData.data.map((point) => {
                  const Icon = CATEGORY_ICONS[point.category] || Wrench;
                  return (
                    <Card
                      key={point.id}
                      className={cn(
                        'cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
                        point.isUrgent
                          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          : 'bg-card text-foreground border-border hover:border-primary/20',
                      )}
                      onClick={() => handlePainPointClick(point.slug)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Icon className="h-6 w-6 text-primary" />
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[point.category] || point.category}
                            </Badge>
                            {point.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{point.title}</CardTitle>
                      </CardHeader>
                      {point.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {point.description}
                          </p>
                        </CardContent>
                      )}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tidak ada masalah kendaraan yang ditemukan. Coba ubah filter atau kata kunci pencarian.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}



