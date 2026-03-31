import { notFound, redirect } from 'next/navigation';
import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Eye, Wrench, CheckCircle2, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/ui/share-button';
import { ArticleStructuredData } from './components/ArticleStructuredData';

export const revalidate = 3600;

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

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

interface ArticleContent {
  causes?: string[];
  diagnosis?: string[];
  costEstimate?: { minIDR: number; maxIDR: number; notes: string };
  safety?: string;
  prevention?: string[];
  faq?: Array<{ question: string; answer: string }>;
}

interface Article {
  id: string;
  slug: string;
  painPoint_id?: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: ArticleContent;
  imageUrl?: string;
  publishedAt?: string | null;
  generatedAt?: string;
  viewCount?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  painPoint?: { id: string; slug: string; title: string; category: string };
}

interface RecommendedWorkshop {
  id: string;
  name: string;
  slug: string;
  address?: string;
  logo?: string | null;
  city?: string;
  mobile?: string;
  claimStatus?: string;
}

async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/wks/articles/slug/${encodeURIComponent(slug)}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data || null;
  } catch {
    return null;
  }
}

async function getRecommendedWorkshops(articleId: string): Promise<RecommendedWorkshop[]> {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(
      `${apiBase}/wks/articles/${encodeURIComponent(articleId)}/recommended-workshops`,
      {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/wks/articles?status=PUBLISHED&limit=1000`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    const items: Array<{ slug: string; painPoint?: { slug?: string } }> = Array.isArray(data)
      ? data
      : (data?.data || []);
    return items
      .filter((item) => item.slug && item.painPoint?.slug !== item.slug)
      .map((item) => ({ slug: item.slug.replace(/^seasonal-/, '') }));
  } catch {
    return [];
  }
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const rawSlug = params?.slug ?? '';
  const slug = rawSlug.replace(/^seasonal-/, '');

  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Redirect artikel yang terkait pain point ke /masalah/{slug}
  if (article.painPoint?.slug === slug) {
    redirect(`/masalah/${slug}`);
  }

  const workshops = article.id ? await getRecommendedWorkshops(article.id) : [];
  const content: ArticleContent = article.content || {};
  const articleSlug = article.slug?.replace(/^seasonal-/, '') || article.slug;
  const painPointSlug = article.painPoint?.slug;
  const painPointTitle = article.painPoint?.title || 'kendala ini';
  const isSeasonal = !article.painPoint;

  return (
    <>
      <ArticleStructuredData article={article} />

      <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {!isSeasonal && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link href={painPointSlug ? `/bengkel?painPoint=${painPointSlug}` : '/bengkel'}>
              <Button size="sm">Cari bengkel untuk {painPointTitle}</Button>
            </Link>
          </div>
        )}

        {isSeasonal && (
          <div className="mb-6">
            <Link href="/bengkel">
              <Button size="sm">Cari Bengkel Terdekat</Button>
            </Link>
          </div>
        )}

        <article className="space-y-6">
          {/* Meta Info & Share Button */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {article.painPoint?.category && (
                <Badge
                  className={
                    cn(CATEGORY_COLORS[article.painPoint.category] || 'bg-gray-100', 'border')
                  }
                >
                  {CATEGORY_LABELS[article.painPoint.category] || article.painPoint.category}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(
                    article.publishedAt || article.generatedAt || Date.now(),
                  ).toLocaleDateString('id-ID', {
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
              description={article.metaDescription || ''}
              variant="outline"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">{article.title}</h1>

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
                    {content.causes.map((cause, i) => (
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
                    {content.diagnosis.map((step, i) => (
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
                    Estimasi Biaya Perbaikan
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
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Tips Keselamatan</h2>
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
                    {content.prevention.map((tip, i) => (
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
                    {content.faq.map((item, i) => (
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
          {workshops.length > 0 && (
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
                          <h3 className="font-semibold text-gray-900 truncate">{workshop.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {workshop.city || 'Kota tidak tersedia'}
                          </p>
                          <div className="flex flex-col gap-2">
                            {workshop.mobile && (
                              workshop.claimStatus === 'CLAIMED' ? (
                                <a
                                  href={`https://wa.me/${workshop.mobile.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full"
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full gap-2 border-green-600/40 text-green-600"
                                  >
                                    <MessageCircle className="h-4 w-4" /> WhatsApp
                                  </Button>
                                </a>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="w-full gap-2 opacity-50"
                                >
                                  <MessageCircle className="h-4 w-4" /> WhatsApp
                                </Button>
                              )
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
                  <Button size="lg">Lihat Semua Bengkel untuk {article.painPoint?.title}</Button>
                </Link>
              </div>
            </section>
          )}
        </article>
      </main>
    </>
  );
}
