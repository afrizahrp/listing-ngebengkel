'use client';

import { useMemo, useState } from 'react';

import { BookingBranchList } from './BookingBranchList';
import { BookingSearchBar } from './BookingSearchBar';
import type { BookingBranch } from '@/types/booking';
import { useWaitingLists as useWL } from '@/queryHooks/useWaitingList';

type BookingCTAVariant = 'section' | 'dialog';

interface WaitingListListItem {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  mobile?: string | null;
  logo?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  workshopTypes?: Array<{ id: string; name: string | null }>;
  promoPreview?: {
    id: string;
    title: string;
    promoType: string;
    checklist?: string[] | null;
  } | null;
}

interface ExtendedBranch extends BookingBranch {
  typeName?: string | null;
  promoPreview?: WaitingListListItem['promoPreview'];
}

export function BookingCTA({ variant = 'section' }: { variant?: BookingCTAVariant }) {
  const { data: waitingLists, isLoading, isError } = useWL();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const branches: ExtendedBranch[] = useMemo(() => {
    if (!waitingLists) return [];
    const items = waitingLists as WaitingListListItem[];
    return items.map((item) => {
      const typeName =
        Array.isArray(item.workshopTypes) && item.workshopTypes.length > 0
          ? item.workshopTypes[0]?.name ?? null
          : null;
      const b: ExtendedBranch = {
        id: item.id,
        name: item.name,
        city: null,
        district: null,
        address: item.address ?? null,
        phone: item.phone ?? item.mobile ?? null,
        logo: item.logo ?? null,
        company: { id: item.categoryId ?? 'UNKNOWN', name: item.categoryName ?? item.name },
        slots: [],
        typeName,
        promoPreview: item.promoPreview ?? null,
      };
      return b;
    });
  }, [waitingLists]);

  const filteredBranches: ExtendedBranch[] = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const hasPromoKeyword = /\bpromo\b/.test(normalized);
    const rest = normalized.replace(/\bpromo\b/g, '').trim();

    return branches.filter((b) => {
      const p = b.promoPreview;
      const hasPromo = Boolean(p);

      // If user types 'promo' only → show all that have promo
      if (hasPromoKeyword && rest.length === 0) return hasPromo;

      const textHit =
        rest.length === 0 ||
        b.name.toLowerCase().includes(rest) ||
        (b.company?.name || '').toLowerCase().includes(rest) ||
        (b.typeName ? b.typeName.toLowerCase().includes(rest) : false);

      if (hasPromoKeyword) {
        return hasPromo && textHit;
      }
      return textHit;
    });
  }, [branches, searchTerm]);

  return (
    <section className={variant === 'section' ? 'w-full bg-white py-12 text-[#2f2f2f]' : 'w-full rounded-3xl bg-background text-[#2f2f2f]'}>
      <div
        className={
          variant === 'section'
            ? 'mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 lg:px-0'
            : 'mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-gray-200 bg-background/95 px-6 py-8 shadow-xl sm:px-10 sm:py-10'
        }
      >
        <header className="space-y-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Promo &amp; Bengkel</p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Temukan Bengkel Promo di Sekitar Anda</h1>
          <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">Ketik nama bengkel, jenis layanan, atau kata kunci seperti “promo”.</p>
        </header>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <BookingSearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Daftar Bengkel</p>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat daftar bengkel...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">Gagal memuat daftar bengkel.</p>
          ) : (
            <BookingBranchList branches={filteredBranches} />
          )}
        </div>
      </div>
    </section>
  );
}


