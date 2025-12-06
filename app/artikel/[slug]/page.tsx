'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import * as React from 'react';
import { useArticles } from '@/queryHooks/useArticles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ui/share-button';
import { ArrowLeft, Eye, Calendar, CheckCircle2, AlertCircle, Wrench, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArticleStructuredData } from './components/ArticleStructuredData';

const CATEGORY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800 border-red-200',
  GENERAL: 'bg-blue-100 text-blue-800 border-blue-200',
  MAINTENANCE: 'bg-green-100 text-green-800 border-green-200',
  BODYWORK: 'bg-purple-100 text-purple-800 border-purple-200',
  ELECTRICAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string;

  const { article, workshops, loading, error, fetchArticleBySlug, fetchRecommendedWorkshops } = useArticles();
  const [hasAttemptedFetch, setHasAttemptedFetch] = React.useState(false);

  useEffect(() => {
    if (slug) {
      setHasAttemptedFetch(true);
      fetchArticleBySlug(slug).then((articleData) => {
        if (articleData?.id) {
          fetchRecommendedWorkshops(articleData.id);
        }
      }).catch((err) => {
        console.error('Failed to fetch article:', err);
      });
    }
  }, [slug, fetchArticleBySlug, fetchRecommendedWorkshops]);

  const content = article?.content || {};

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
        <div className="space-y-6">
          {/* Skeleton loader for better perceived performance */}
          <div className="animate-pulse space-y-4">
            {/* Title skeleton */}
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            {/* Meta info skeleton */}
            <div className="flex gap-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            {/* Image skeleton */}
            <div className="relative w-full h-[400px] rounded-lg bg-gray-200"></div>
            {/* Content skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || (hasAttemptedFetch && !article && !loading)) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Artikel Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">
            Artikel yang Anda cari tidak tersedia atau sudah dihapus
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button variant="outline" onClick={() => router.push('/artikel')} className="w-full">
              Lihat Semua Artikel
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // Type guard: at this point article is guaranteed to be not null
  if (!article) {
    return null;
  }

  return (
    <>
      <ArticleStructuredData article={article} />
      
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        {/* Article Header */}
        <article className="space-y-6">
          {/* Meta Info & Share Button */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {article.painPoint?.category && (
                <Badge className={CATEGORY_COLORS[article.painPoint.category] || 'bg-gray-100'}>
                  {article.painPoint.category}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(article.publishedAt || article.generatedAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{article.viewCount || 0} views</span>
              </div>
            </div>
            <ShareButton
              url={`/artikel/${article.slug}`}
              title={article.title}
              description={article.metaDescription}
              variant="outline"
              size="default"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Featured Image */}
          {article.imageUrl && (
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <Card>
            <CardContent className="p-8 space-y-8">
              {/* Penyebab */}
              {content.causes && content.causes.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    Penyebab {article.painPoint?.title}
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

          {/* Recommended Workshops */}
          {workshops && workshops.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Bengkel Rekomendasi untuk {article.painPoint?.title}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {workshops.slice(0, 6).map((workshop) => (
                  <Card key={workshop.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start gap-3 flex-1">
                        {workshop.logo && (
                          <Image
                            src={workshop.logo}
                            alt={workshop.name}
                            width={48}
                            height={48}
                            className="rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {workshop.name}
                          </h3>
                          {workshop.city && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <span>📍</span>
                              <span>{workshop.city}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {workshop.phone && (
                          <a
                            href={`https://wa.me/${workshop.phone.replace(/[^0-9]/g, '').startsWith('0') ? '62' + workshop.phone.replace(/[^0-9]/g, '').slice(1) : workshop.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button
                              variant="outline"
                              size="default"
                              className={cn(
                                "w-full gap-2 rounded-lg",
                                "transition-all duration-200",
                                "focus:outline-none",
                                "h-10"
                              )}
                              style={{
                                borderColor: 'rgba(22, 163, 74, 0.4)',
                                color: '#16A34A',
                                backgroundColor: 'transparent'
                              }}
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </Button>
                          </a>
                        )}
                        <Link href={`/workshop/${workshop.slug}`} className="block">
                          <Button variant="outline" size="sm" className="w-full">
                            Lihat Detail
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href={`/bengkel?painPoint=${article.painPoint?.slug}`}>
                  <Button size="lg">
                    Lihat Semua Bengkel {article.painPoint?.title}
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </article>
      </main>
    </>
  );
}
