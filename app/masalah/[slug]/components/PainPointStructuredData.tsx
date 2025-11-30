'use client';

import { useEffect } from 'react';
import type { PainPointDetail } from '@/queryHooks/usePainPoints';

type PainPointStructuredDataProps = {
  painPoint: PainPointDetail;
};

export function PainPointStructuredData({ painPoint }: PainPointStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: painPoint.title,
      description: painPoint.description || painPoint.title,
      image: painPoint.imageUrl || 'https://ngebengkel.com/logo.webp',
      datePublished: painPoint.createdAt,
      dateModified: painPoint.updatedAt,
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
          url: 'https://ngebengkel.com/logo.webp',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://ngebengkel.com/masalah/${painPoint.slug}`,
      },
      keywords: painPoint.keywords?.join(', ') || '',
      about: {
        '@type': 'Thing',
        name: painPoint.title,
        description: painPoint.description || painPoint.title,
      },
      ...(painPoint.serviceTypes && painPoint.serviceTypes.length > 0 && {
        mentions: painPoint.serviceTypes.map((st) => ({
          '@type': 'Service',
          name: st.name,
        })),
      }),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'pain-point-structured-data';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('pain-point-structured-data');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [painPoint]);

  return null;
}


