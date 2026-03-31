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
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount?: number;
  painPoint?: { id: string; slug: string; title: string; category: string };
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
    author: { '@type': 'Organization', name: 'Ngebengkel.com', url: 'https://ngebengkel.com' },
    publisher: {
      '@type': 'Organization',
      name: 'Ngebengkel.com',
      logo: { '@type': 'ImageObject', url: 'https://ngebengkel.com/logo-circle.webp' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ngebengkel.com/artikel/${article.slug}`,
    },
  };

  const faqSchema =
    content.faq && content.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }
      : null;

  const howToSchema =
    content.diagnosis && content.diagnosis.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: `Cara Mendiagnosis ${article.painPoint?.title || article.title}`,
          description: article.metaDescription,
          image: article.imageUrl,
          step: content.diagnosis.map((step, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: `Langkah ${i + 1}`,
            text: step,
          })),
        }
      : null;

  return (
    <>
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
    </>
  );
}
