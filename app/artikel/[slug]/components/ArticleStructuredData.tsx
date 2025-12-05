import Head from 'next/head';

interface ArticleContent {
  causes?: string[];
  diagnosis?: string[];
  costEstimate?: {
    minIDR: number;
    maxIDR: number;
    notes: string;
  };
  safety?: string;
  prevention?: string[];
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: ArticleContent;
  imageUrl: string;
  publishedAt: string | null;
  generatedAt: string;
  painPoint?: {
    title: string;
    category: string;
  };
}

interface ArticleStructuredDataProps {
  article: Article;
}

export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  const content = article.content || {};
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    image: article.imageUrl,
    datePublished: article.publishedAt || article.generatedAt,
    dateModified: article.publishedAt || article.generatedAt,
    author: {
      '@type': 'Organization',
      name: 'Ngebengkel.com',
      url: 'https://ngebengkel.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ngebengkel.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ngebengkel.com/logo-circle.webp',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ngebengkel.com/artikel/${article.slug}`,
    },
  };

  // Add FAQ schema if available
  const faqSchema = content.faq && content.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((item: { question: string; answer: string }) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  // Add HowTo schema if diagnosis available
  const howToSchema = content.diagnosis && content.diagnosis.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Cara Mendiagnosis ${article.painPoint?.title || article.title}`,
    description: article.metaDescription,
    image: article.imageUrl,
    step: content.diagnosis.map((step: string, i: number) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: `Langkah ${i + 1}`,
      text: step,
    })),
  } : null;

  return (
    <Head>
      <title>{article.metaTitle}</title>
      <meta name="description" content={article.metaDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={article.metaTitle} />
      <meta property="og:description" content={article.metaDescription} />
      <meta property="og:image" content={article.imageUrl} />
      <meta property="og:url" content={`https://ngebengkel.com/artikel/${article.slug}`} />
      <meta property="og:type" content="article" />
      <meta property="article:published_time" content={article.publishedAt || article.generatedAt} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={article.metaTitle} />
      <meta name="twitter:description" content={article.metaDescription} />
      <meta name="twitter:image" content={article.imageUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://ngebengkel.com/artikel/${article.slug}`} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
    </Head>
  );
}
