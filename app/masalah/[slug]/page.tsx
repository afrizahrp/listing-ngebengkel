'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePainPoint } from '@/queryHooks/usePainPoints';
import { usePainPoints } from '@/queryHooks/usePainPoints';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wrench, AlertTriangle, Settings, Car, Lightbulb, Loader2, Wheel, Wind } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PainPointStructuredData } from './components/PainPointStructuredData';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  URGENT: AlertTriangle,
  GENERAL: Wrench,
  MAINTENANCE: Settings,
  BODYWORK: Car,
  ELECTRICAL: Lightbulb,
  STEERING: Wheel,
  SUSPENSION: Wind,
  TIRES: Wheel,
};

const CATEGORY_LABELS: Record<string, string> = {
  URGENT: 'Urgent',
  GENERAL: 'Umum',
  MAINTENANCE: 'Perawatan',
  BODYWORK: 'Body',
  ELECTRICAL: 'Kelistrikan',
  STEERING: 'Stir',
  SUSPENSION: 'Suspensi',
  TIRES: 'Ban',
};

export default function PainPointDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: painPoint, isLoading, isError } = usePainPoint(slug, {
    enabled: Boolean(slug),
  });

  // Fetch related pain points (same category)
  const { data: relatedPainPoints } = usePainPoints({
    category: painPoint?.category,
    limit: 6,
    enabled: Boolean(painPoint?.category),
  });

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  if (isError || !painPoint) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-destructive">
            {isError ? 'Gagal memuat data masalah kendaraan.' : 'Data masalah kendaraan tidak ditemukan.'}
          </p>
        </div>
      </main>
    );
  }

  const Icon = CATEGORY_ICONS[painPoint.category] || Wrench;
  const categoryLabel = CATEGORY_LABELS[painPoint.category] || painPoint.category;

  return (
    <>
      <PainPointStructuredData painPoint={painPoint} />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Listing
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Icon className="h-8 w-8 text-primary" />
              <Badge variant="secondary" className="text-sm">
                {categoryLabel}
              </Badge>
              {painPoint.isUrgent && (
                <Badge variant="destructive" className="text-sm">
                  Urgent
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{painPoint.title}</h1>
            {painPoint.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">{painPoint.description}</p>
            )}
          </div>

          {/* Image */}
          {painPoint.imageUrl && (
            <Card className="overflow-hidden">
              <div className="relative h-64 md:h-80 w-full bg-gray-100">
                <Image
                  src={painPoint.imageUrl}
                  alt={painPoint.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={painPoint.imageUrl.startsWith('http')}
                />
              </div>
            </Card>
          )}

          {/* Keywords */}
          {painPoint.keywords && painPoint.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kata Kunci Terkait</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {painPoint.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Types */}
          {painPoint.serviceTypes && painPoint.serviceTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Layanan yang Tersedia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {painPoint.serviceTypes.map((serviceType) => (
                    <div
                      key={serviceType.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <span className="font-medium">{serviceType.name}</span>
                      {serviceType.relevance && (
                        <Badge variant="secondary" className="text-xs">
                          Relevansi: {Math.round(serviceType.relevance * 100)}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Butuh Bantuan Segera?</h3>
                <p className="text-muted-foreground">
                  Temukan bengkel yang tepat di dekat Kamu untuk mengatasi masalah kendaraan ini.
                </p>
                <Button size="lg" onClick={() => router.push(`/bengkel?painPoint=${painPoint.slug}`)}>
                  Cari Bengkel untuk &quot;{painPoint.title}&quot;
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Related Pain Points */}
        <div className="space-y-6">
          {relatedPainPoints?.data && relatedPainPoints.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Masalah Lainnya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedPainPoints.data
                    .filter((pp) => pp.id !== painPoint.id)
                    .slice(0, 5)
                    .map((related) => {
                      const RelatedIcon = CATEGORY_ICONS[related.category] || Wrench;
                      return (
                        <Link
                          key={related.id}
                          href={`/masalah/${related.slug}`}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg border bg-card',
                            'hover:bg-primary/5 hover:border-primary/20 transition-colors',
                            'cursor-pointer',
                          )}
                        >
                          <RelatedIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight">{related.title}</h4>
                            {related.isUrgent && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </main>
    </>
  );
}

