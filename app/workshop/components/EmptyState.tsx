'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, AlertCircle, Search } from 'lucide-react';
import { usePainPoints } from '@/queryHooks/usePainPoints';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type EmptyStateProps = {
  title?: string;
  description?: string;
  showPainPointSuggestions?: boolean;
  className?: string;
};

export function EmptyState({
  title = 'Tidak ada bengkel yang ditemukan',
  description = 'Coba pilih kota lain atau sesuaikan kata kunci pencarian.',
  showPainPointSuggestions = true,
  className,
}: EmptyStateProps) {
  const router = useRouter();
  const { data: popularPainPoints } = usePainPoints({
    isPopular: true,
    isActive: true,
    limit: 6,
    orderBy: 'popularity',
    orderDir: 'desc',
  });

  const handlePainPointClick = (slug: string) => {
    router.push(`/bengkel?painPoint=${slug}`);
  };

  return (
    <div className={cn('py-12 px-4', className)}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-8">{description}</p>

        {showPainPointSuggestions && popularPainPoints?.data && popularPainPoints.data.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-medium text-foreground mb-4">
              Atau coba cari berdasarkan masalah kendaraan:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {popularPainPoints.data.slice(0, 6).map((point) => (
                <Button
                  key={point.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePainPointClick(point.slug)}
                  className="text-sm"
                  aria-label={`Cari bengkel untuk ${point.title}`}
                >
                  <Wrench className="h-3 w-3 mr-1.5" aria-hidden="true" />
                  {point.title}
                </Button>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/masalah"
                className="text-sm text-primary hover:underline"
                aria-label="Lihat semua masalah kendaraan"
              >
                Lihat semua masalah kendaraan →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


