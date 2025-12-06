'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useArticles } from '@/queryHooks/useArticles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ui/share-button';
import { ArrowLeft, Eye, Calendar, CheckCircle2, AlertCircle, Wrench, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ArticleStructuredData } from './components/ArticleStructuredData';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800 border-red-200',
  GENERAL: 'bg-blue-100 text-blue-800 border-blue-200',
  MAINTENANCE: 'bg-green-100 text-green-800 border-green-200',
  BODYWORK: 'bg-purple-100 text-purple-800 border-purple-200',
  ELECTRICAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SUSPENSION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  TIRES: 'bg-pink-100 text-pink-800 border-pink-200',
};

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const rawSlug = (params?.slug as string) || '';
  const slug = rawSlug.replace(/^seasonal-/, '');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    || (typeof window !== 'undefined' && window.location.origin)
    || 'https://ngebengkel.com';



  const { article, workshops, loading, error, fetchArticleBySlug, fetchRecommendedWorkshops } = useArticles();

  useEffect(() => {
    if (slug) {
      fetchArticleBySlug(slug).then((articleData) => {
        // Redirect to /masalah/{slug} if pain point exists and matches the slug
        if (articleData?.painPoint?.slug === slug) {
          router.replace(`/masalah/${slug}`);
          return;
        }

        if (articleData?.id) {
          fetchRecommendedWorkshops(articleData.id);
        }
      }).catch((err) => {
        console.error('Failed to fetch article:', err);
      });
    }
  }, [slug, fetchArticleBySlug, fetchRecommendedWorkshops, router]);

  const content = article?.content || {};

  // Only show error/skeleton if we've attempted to load (loading was true at some point)
  if (error || (!article && loading === false)) {
    if (loading) {
      return (
        <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Back Button Skeleton */}
            <Skeleton className="h-10 w-24" />

            {/* Meta Info Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>

            {/* Featured Image Skeleton */}
            <Skeleton className="w-full h-[400px] rounded-lg" />

            {/* Content Skeleton */}
            <Card>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      );
    }

    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Artikel Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">
            Artikel yang Anda cari tidak tersedia atau sudah dihapus
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Card>
      </main>
    );
  }

  // At this point, article is guaranteed to be non-null
  if (!article) {
    return null;
  }

  const articleSlug = article.slug?.replace(/^seasonal-/, '') || article.slug;
  const painPointSlug = article.painPoint?.slug;
  const painPointTitle = article.painPoint?.title || 'kendala ini';
  const isSeasonal = !article.painPoint; // Detect if it's a seasonal article


  return (
    <>
      <ArticleStructuredData article={article} />
      
      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
               {!isSeasonal && (

       <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href={painPointSlug ? `/bengkel?painPoint=${painPointSlug}` : '/bengkel'}>
            <Button size="sm">
              Cari bengkel untuk {painPointTitle}
            </Button>
          </Link>
        
        </div>
        )}

         {/* Alternative CTA for seasonal articles */}
        {isSeasonal && (
          <div className="mb-6">
            <Link href="/bengkel">
              <Button size="sm">
                Cari Bengkel Terdekat
              </Button>
            </Link>
          </div>
        )}

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
              url={`/artikel/${articleSlug}`}
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
                  <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {workshop.logo && (
                          <Image
                            src={workshop.logo}
                            alt={workshop.name}
                            width={48}
                            height={48}
                            className="rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {workshop.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {workshop.city || 'Kota tidak tersedia'}
                          </p>
                          <div className="flex flex-col gap-2">
                            {workshop.mobile && (
                              <a 
                                href={`https://wa.me/${workshop.mobile.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                              >
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className={cn(
                                    "w-full gap-2 rounded-lg",
                                    "transition-all duration-200",
                                    "focus:outline-none",
                                    "h-9"
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
                            <Link href={`/workshop/${workshop.slug}`} className="w-full">
                              <Button variant="outline" size="sm" className="w-full">
                                Lihat Detail
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href={`/bengkel?painPoint=${article.painPoint?.slug}`}>
                  <Button size="lg">
                    Lihat Semua Bengkel untuk {article.painPoint?.title}
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
