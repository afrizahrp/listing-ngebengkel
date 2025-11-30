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
  Settings,
  Loader2,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  URGENT: AlertTriangle,
  GENERAL: Wrench,
  MAINTENANCE: Settings,
  BODYWORK: Car,
  ELECTRICAL: Lightbulb,
};

const CATEGORY_LABELS: Record<string, string> = {
  URGENT: 'Urgent',
  GENERAL: 'Umum',
  MAINTENANCE: 'Perawatan',
  BODYWORK: 'Body',
  ELECTRICAL: 'Kelistrikan',
};

export default function PainPointsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: painPointsData, isLoading } = usePainPoints({
    isActive: true,
    category: (selectedCategory as 'URGENT' | 'GENERAL' | 'MAINTENANCE' | 'BODYWORK' | 'ELECTRICAL') || undefined,
    search: searchQuery || undefined,
    limit: 100,
    orderBy: 'popularity',
    orderDir: 'desc',
  });

  const handlePainPointClick = (slug: string) => {
    router.push(`/bengkel?painPoint=${slug}`);
  };

  const categories = ['URGENT', 'GENERAL', 'MAINTENANCE', 'BODYWORK', 'ELECTRICAL'];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Masalah Kendaraan</h1>
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Semua
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {painPointsData?.data && painPointsData.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

