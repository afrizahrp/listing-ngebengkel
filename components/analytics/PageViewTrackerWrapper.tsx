'use client';

import { Suspense } from 'react';
import PageViewTracker from './page-view-tracker';

export default function PageViewTrackerWrapper() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}


