'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { gtagPageView, GA_MEASUREMENT_ID } from '@/lib/gtag';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    const url = `${origin}${pathname}${
      searchParams?.toString() ? `?${searchParams.toString()}` : ''
    }`;

    gtagPageView(url, document.title);
  }, [pathname, searchParams]);

  return null;
}


