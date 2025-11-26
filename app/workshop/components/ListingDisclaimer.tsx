'use client';

import { Info } from 'lucide-react';

export function ListingDisclaimer() {
  return (
    <div className="mt-8 pt-6 border-t border-border/50">
      <div className="flex items-start gap-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/70" />
        <div className="space-y-1">
          <p>
            Listing ini dapat berasal dari data publik atau informasi yang diberikan langsung oleh pemilik.
          </p>
          <p>
            Jika ini adalah bengkel Anda,{' '}
            <span className="text-foreground font-medium">klaim listing</span>{' '}
            untuk mengelola foto, jam buka, dan layanan.
          </p>
        </div>
      </div>
    </div>
  );
}


