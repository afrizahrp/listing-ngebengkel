'use client';

import { CTA } from '@/app/workshop/components/CTA';

/**
 * Page untuk listing bengkel dengan query parameter
 * 
 * Supports:
 * - /bengkel?painPoint=ac-tidak-dingin (filter by pain point)
 * - /bengkel?q=search+query (search query)
 * - /bengkel (show all)
 * 
 * afriza here
 */
export default function BengkelPage() {
  return (
    <main className="min-h-screen">
     
        <CTA variant="section" />
    </main>
  );
}


