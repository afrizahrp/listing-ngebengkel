'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePainPoint } from '@/queryHooks/usePainPoints';
import { usePainPoints } from '@/queryHooks/usePainPoints';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wrench, AlertTriangle, Settings, Car, Lightbulb, Loader2, Circle, Wind, Calendar, Eye, CheckCircle2, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PainPointStructuredData } from './components/PainPointStructuredData';
import { useArticles } from '@/queryHooks/useArticles';
import { ShareButton } from '@/components/ui/share-button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleStructuredData } from '@/app/artikel/[slug]/components/ArticleStructuredData';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  URGENT: AlertTriangle,
  GENERAL: Wrench,
  MAINTENANCE: Settings,
  BODYWORK: Car,
  ELECTRICAL: Lightbulb,
  STEERING: Circle,
  SUSPENSION: Wind,
  TIRES: Circle,
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

  // Article state
  const { article, loading: articleLoading, error: articleError, fetchArticleBySlug } = useArticles();
  const [articleFetched, setArticleFetched] = useState(false);

  useEffect(() => {
    if (
      painPoint &&
      painPoint.articles &&
      painPoint.articles.length > 0 &&
      painPoint.articles[0].slug &&
      typeof painPoint.articles[0].slug === 'string' &&
      painPoint.articles[0].slug.trim() !== '' &&
      !articleFetched
    ) {
      // Fetch the first related article by slug
      fetchArticleBySlug(painPoint.articles[0].slug);
      setArticleFetched(true);
    }
  }, [painPoint, fetchArticleBySlug, articleFetched]);

  // Fetch related pain points (same category)
  const { data: relatedPainPoints } = usePainPoints({
    category: painPoint?.category,
    limit: 6,
    enabled: Boolean(painPoint?.category),
  });

  if (isLoading || (painPoint && painPoint.articles && painPoint.articles.length > 0 && (articleLoading || !article))) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  if (isError || !painPoint || articleError) {
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
  // Use article content if available
  const content = article?.content || {};

  return (
    <>
      <PainPointStructuredData painPoint={painPoint} />
      {article && <ArticleStructuredData article={article} />}
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

            {/* Article Content Sections */}
            {article && (
              <Card>
                <CardContent className="p-8 space-y-8">
                  {/* Penyebab */}
                  {content.causes && content.causes.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        Penyebab {painPoint.title}
                      </h2>
                      <ul className="space-y-3">
                        {content.causes.map((cause: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700">
                            <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                              {i + 1}
                            </span>
                            <span className="flex-1">{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Cara Diagnosis */}
                  {content.diagnosis && content.diagnosis.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Wrench className="h-6 w-6 text-blue-600" />
                        Cara Diagnosis
                      </h2>
                      <ol className="space-y-3">
                        {content.diagnosis.map((step: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                              {i + 1}
                            </span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}

                  {/* Estimasi Biaya */}
                  {content.costEstimate && (
                    <section className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        💰 Estimasi Biaya Perbaikan
                      </h2>
                      <p className="text-2xl font-bold text-yellow-900 mb-2">
                        Rp {content.costEstimate.minIDR?.toLocaleString('id-ID')} - Rp{' '}
                        {content.costEstimate.maxIDR?.toLocaleString('id-ID')}
                      </p>
                      {content.costEstimate.notes && (
                        <p className="text-sm text-gray-700">{content.costEstimate.notes}</p>
                      )}
                    </section>
                  )}

                  {/* Safety Tips */}
                  {content.safety && (
                    <section className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        ⚠️ Tips Keselamatan
                      </h2>
                      <p className="text-gray-700">{content.safety}</p>
                    </section>
                  )}

                  {/* Cara Pencegahan */}
                  {content.prevention && content.prevention.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        Cara Pencegahan
                      </h2>
                      <ul className="space-y-3">
                        {content.prevention.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700">
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="flex-1">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* FAQ */}
                  {content.faq && content.faq.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Pertanyaan yang Sering Ditanyakan
                      </h2>
                      <div className="space-y-4">
                        {content.faq.map((item: { question: string; answer: string }, i: number) => (
                          <Card key={i} className="border-l-4 border-l-blue-600">
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                              <p className="text-gray-700">{item.answer}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}
                </CardContent>
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

