'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePainPoint } from '@/queryHooks/usePainPoints';
import { useArticles } from '@/queryHooks/useArticles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ui/share-button';
import { ArrowLeft, Calendar, Eye, AlertCircle, Wrench, CheckCircle2, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PainPointStructuredData } from './components/PainPointStructuredData';
import { ArticleStructuredData } from '@/app/artikel/[slug]/components/ArticleStructuredData';
import { Loader2 } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800 border-red-200',
  GENERAL: 'bg-blue-100 text-blue-800 border-blue-200',
  MAINTENANCE: 'bg-green-100 text-green-800 border-green-200',
  BODYWORK: 'bg-purple-100 text-purple-800 border-purple-200',
  ELECTRICAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SUSPENSION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  TIRES: 'bg-pink-100 text-pink-800 border-pink-200',
  STEERING: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function PainPointDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: painPoint, isLoading: ppLoading, isError: ppError } = usePainPoint(slug, { enabled: !!slug });

  const { article, workshops, loading: articleLoading, error: articleError, fetchArticleBySlug, fetchRecommendedWorkshops } = useArticles();
  const [articleFetched, setArticleFetched] = useState(false);

  // Fetch article kalau ada
  useEffect(() => {
    if (painPoint?.articles?.[0]?.slug && !articleFetched) {
      fetchArticleBySlug(painPoint.articles[0].slug).then((data) => {
        if (data?.id) fetchRecommendedWorkshops(data.id);
      });
      setArticleFetched(true);
    }
  }, [painPoint, articleFetched, fetchArticleBySlug, fetchRecommendedWorkshops]);

  const content = article?.content || {};
  const isLoading = ppLoading || (painPoint?.articles?.length && articleLoading);
  const hasError = ppError || articleError || (!painPoint && !ppLoading);

  // Loading state
  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-16">
        <div className="flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  // Error state
  if (hasError || !painPoint) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Masalah Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Data yang Anda cari tidak tersedia atau sudah dihapus.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Card>
      </main>
    );
  }

  const heroImage = article?.imageUrl || painPoint.imageUrl;
  const publishedDate = painPoint.createdAt ? new Date(painPoint.createdAt) : new Date();
  const viewCount = painPoint.viewCount || 0;

  return (
    <>
      <PainPointStructuredData painPoint={painPoint} />
      {article && <ArticleStructuredData article={article} />}

      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* CTA Cari Bengkel */}
        <div className="mb-6">
          <Link href={`/bengkel?painPoint=${painPoint.slug}`}>
            <Button size="sm">
              Cari Bengkel untuk {painPoint.title}
            </Button>
          </Link>
        </div>

        <article className="space-y-6">
          {/* Meta + Share */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {painPoint.category && (
                <Badge className={cn('border', CATEGORY_COLORS[painPoint.category] || 'bg-gray-100')}>
                  {painPoint.category === 'URGENT' ? 'Urgent' : painPoint.category.charAt(0) + painPoint.category.slice(1).toLowerCase()}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{publishedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{viewCount} views</span>
              </div>
            </div>

            <ShareButton
              url={`https://yourdomain.com/masalah/${painPoint.slug}`}
              title={painPoint.title}
              description={article?.metaDescription || painPoint.description || ''}
              variant="outline"
            />
          </div>

          {/* Judul Besar */}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {painPoint.title}
          </h1>

          {/* Hero Image */}
          {heroImage && (
            <div className="relative w-full h-96 md:h-[500px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={heroImage}
                alt={painPoint.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Konten Utama */}
          <Card>
            <CardContent className="p-8 space-y-10">
              {/* Penyebab */}
              {content.causes?.length ? (
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    Penyebab {painPoint.title}
                  </h2>
                  <ul className="space-y-3">
                    {content.causes.map((cause: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* Diagnosis */}
              {content.diagnosis?.length ? (
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Wrench className="h-6 w-6 text-blue-600" />
                    Cara Diagnosis
                  </h2>
                  <ol className="space-y-3">
                    {content.diagnosis.map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {/* Estimasi Biaya */}
              {content.costEstimate && (
                <section className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-3">Estimasi Biaya Perbaikan</h2>
                  <p className="text-2xl font-bold text-yellow-900">
                    Rp {content.costEstimate.minIDR?.toLocaleString('id-ID')} - Rp {content.costEstimate.maxIDR?.toLocaleString('id-ID')}
                  </p>
                  {content.costEstimate.notes && <p className="text-sm text-gray-700 mt-2">{content.costEstimate.notes}</p>}
                </section>
              )}

              {/* Safety */}
              {content.safety && (
                <section className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-3">Tips Keselamatan</h2>
                  <p className="text-gray-700">{content.safety}</p>
                </section>
              )}

              {/* Pencegahan */}
              {content.prevention?.length ? (
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Cara Pencegahan
                  </h2>
                  <ul className="space-y-3">
                    {content.prevention.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* FAQ */}
              {content.faq?.length ? (
                <section>
                  <h2 className="text-2xl font-bold mb-6">Pertanyaan yang Sering Ditanyakan</h2>
                  <div className="space-y-4">
                    {content.faq.map((item: { question: string; answer: string }, i: number) => (
                      <Card key={i} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{item.question}</h3>
                          <p className="text-gray-700">{item.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              ) : null}
            </CardContent>
          </Card>

          {/* Rekomendasi Bengkel */}
          {workshops && workshops.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">
                Bengkel Rekomendasi untuk {painPoint.title}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {workshops.slice(0, 6).map((workshop) => (
                  <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {workshop.logo && (
                          <Image src={workshop.logo} alt={workshop.name} width={48} height={48} className="rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold truncate">{workshop.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{workshop.city || 'Kota tidak tersedia'}</p>
                          <div className="flex flex-col gap-2">
                            {workshop.mobile && (
                              workshop.claimStatus === 'CLAIMED' ? (
                                <a href={`https://wa.me/${workshop.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline" className="w-full gap-2 border-green-600/40 text-green-600">
                                    <MessageCircle className="h-4 w-4" /> WhatsApp
                                  </Button>
                                </a>
                              ) : (
                                <Button size="sm" variant="outline" disabled className="w-full opacity-50">
                                  <MessageCircle className="h-4 w-4" /> WhatsApp
                                </Button>
                              )
                            )}
                            <Link href={`/workshop/${workshop.slug}`}>
                              <Button variant="outline" size="sm" className="w-full">Lihat Detail</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href={`/bengkel?painPoint=${painPoint.slug}`}>
                  <Button size="lg">Lihat Semua Bengkel</Button>
                </Link>
              </div>
            </section>
          )}
        </article>
      </main>
    </>
  );
}