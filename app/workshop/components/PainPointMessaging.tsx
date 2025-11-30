'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Car,
  Lightbulb,
  AlertTriangle,
  Settings,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PainPointBadge } from './PainPointBadge';
import { SearchBar } from './SearchBar';
import { usePainPoints } from '@/queryHooks/usePainPoints';
import { usePainPointStore } from '@/store/usePainPointStore';
import { useMatchPainPoint } from '@/queryHooks/useMatchPainPoint';

type PainPointMessagingProps = {
  variant?: 'hero' | 'section' | 'compact';
  className?: string;
};

// Icon mapping untuk pain point categories
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  URGENT: AlertTriangle,
  GENERAL: Wrench,
  MAINTENANCE: Settings,
  BODYWORK: Car,
  ELECTRICAL: Lightbulb,
};

export function PainPointMessaging({
  variant = 'section',
  className,
}: PainPointMessagingProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setMatchedPainPoint } = usePainPointStore();

  // Get popular pain points untuk display
  const { data: popularPainPoints, isLoading: isLoadingPopular } = usePainPoints({
    isPopular: true,
    isActive: true,
    limit: 6,
    orderBy: 'popularity',
    orderDir: 'desc',
  });

  // Match query ke pain point
  const { data: match } = useMatchPainPoint({
    query: searchQuery || '',
    debounceMs: 300,
    enabled: (searchQuery || '').trim().length > 0,
  });

  // Update store saat match berubah
  useEffect(() => {
    if (match) {
      setMatchedPainPoint(match);
    } else if (!searchQuery.trim()) {
      // Clear match jika query kosong
      setMatchedPainPoint(null);
    }
  }, [match, searchQuery, setMatchedPainPoint]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (match) {
        // Navigate ke pain point detail page
        router.push(`/masalah/${match.painPoint.slug}`);
      } else {
        // Navigate ke listing dengan search query
        router.push(`/bengkel?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handlePainPointClick = (slug: string) => {
    // Navigate ke pain point detail page
    router.push(`/masalah/${slug}`);
  };

  if (variant === 'hero') {
    return (
      <section
        className={cn(
          'relative py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5',
          className,
        )}
      >
        <div className="container mx-auto px-4">
          {/* Hero Message */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Kendaraan Kamu Bermasalah?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Temukan bengkel terpercaya yang siap membantu mengatasi masalah
              kendaraan Kamu
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <SearchBar
                    value={searchQuery}
                    onChange={(value) => {
                      setSearchQuery(value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    ariaLabel="Cari masalah kendaraan atau nama bengkel"
                    placeholder="Cari masalah atau jenis layanan... (contoh: AC tidak dingin, service berkala)"
                    inputRef={searchInputRef}
                  />
                </div>
                <Button onClick={handleSearch} size="lg" className="px-8">
                  Cari Bengkel
                </Button>
              </div>
              {match && (
                <div className="mt-4">
                  <PainPointBadge
                    title={match.painPoint.title}
                    confidence={match.confidence}
                    matchedKeywords={match.matchedKeywords}
                    onDismiss={() => setMatchedPainPoint(null)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Popular Pain Points */}
          {isLoadingPopular ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
              {popularPainPoints?.data?.slice(0, 6).map((point) => {
                const Icon = CATEGORY_ICONS[point.category] || Wrench;
                return (
                  <Card
                    key={point.id}
                    className={cn(
                      'p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2',
                      point.isUrgent
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-primary/5 text-foreground border-primary/20 hover:bg-primary/10',
                    )}
                    onClick={() => handlePainPointClick(point.slug)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Icon className="h-8 w-8 mb-2" />
                      <h3 className="font-semibold text-sm leading-tight">
                        {point.title}
                      </h3>
                      {point.isUrgent && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'compact') {
    return (
      <section className={cn('py-8 bg-muted/30', className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Masalah Umum Kendaraan</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/bengkel')}
            >
              Lihat Semua
            </Button>
          </div>
          {isLoadingPopular ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {popularPainPoints?.data?.slice(0, 6).map((point) => {
                const Icon = CATEGORY_ICONS[point.category] || Wrench;
                return (
                  <Button
                    key={point.id}
                    variant="outline"
                    className={cn(
                      'gap-2',
                      point.isUrgent
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-primary/5 text-foreground border-primary/20 hover:bg-primary/10',
                    )}
                    onClick={() => handlePainPointClick(point.slug)}
                  >
                    <Icon className="h-4 w-4" />
                    {point.title}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default: section variant
  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Kendaraan Kamu Bermasalah?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pilih masalah yang Kamu alami, kami akan membantu menemukan bengkel
            terbaik untuk mengatasinya
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchBar
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                ariaLabel="Cari masalah kendaraan atau nama bengkel"
                placeholder="Cari masalah (contoh: AC tidak dingin, rem blong)"
                inputRef={searchInputRef}
              />
            </div>
            <Button
              onClick={handleSearch}
              size="lg"
              className="px-8"
              aria-label="Cari bengkel"
            >
              Cari
            </Button>
          </div>
          {match && (
            <div className="mt-4" role="status" aria-live="polite">
              <PainPointBadge
                title={match.painPoint.title}
                confidence={match.confidence}
                matchedKeywords={match.matchedKeywords}
                onDismiss={() => setMatchedPainPoint(null)}
              />
            </div>
          )}
        </div>

        {/* Pain Point Grid */}
        {isLoadingPopular ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularPainPoints?.data?.map((point) => {
              const Icon = CATEGORY_ICONS[point.category] || Wrench;
              return (
                <Card
                  key={point.id}
                  className={cn(
                    'p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2',
                    point.isUrgent
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-primary/5 text-foreground border-primary/20 hover:bg-primary/10',
                  )}
                  onClick={() => handlePainPointClick(point.slug)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-3 rounded-lg',
                        point.isUrgent ? 'bg-red-100' : 'bg-primary/10',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-6 w-6',
                          point.isUrgent ? 'text-red-600' : 'text-primary',
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{point.title}</h3>
                        {point.isUrgent && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      {point.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {point.description}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePainPointClick(point.slug);
                        }}
                      >
                        Cari Bengkel
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
