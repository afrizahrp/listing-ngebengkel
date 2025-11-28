'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';

import { BranchList } from './BranchList';
import { SearchBar } from './SearchBar';
import { LoadingDots } from './LoadingDots';
import { ErrorDisplay } from '@/components/ui/error-display';
import type { BookingBranch } from '@/types/booking';
import { useWaitingListsPaginated } from '@/queryHooks/useWaitingList';
import { useDebounce } from '@/hooks/useDebounce';
import { Pagination } from '@/components/ui/pagination';

type CTAVariant = 'section' | 'dialog';

interface WaitingListListItem {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  mobile?: string | null;
  logo?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  city?: string | null;
  cityName?: string | null; // Check if backend already returns cityName
  province?: string | null;
  district?: string | null;
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
  claimStatus?: string | null;
}

export function CTA({ variant = 'section' }: { variant?: CTAVariant }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Check if search term is only "promo" keyword
  const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();
  const isOnlyPromoKeyword = normalizedSearch === 'promo';
  const hasPromoKeyword = /\bpromo\b/.test(normalizedSearch);
  const searchWithoutPromo = normalizedSearch.replace(/\bpromo\b/g, '').trim();
  
  // If search term is only "promo", don't send searchTerm to backend (backend doesn't support promo filtering)
  // Otherwise, send the search term (without "promo" keyword) to backend
  const backendSearchTerm = isOnlyPromoKeyword ? undefined : (searchWithoutPromo || undefined);
  const searchBy = backendSearchTerm ? 'name' : undefined;
  
  const { data: paginatedData, isLoading, isError, error, refetch } = useWaitingListsPaginated({
    page,
    limit: pageSize,
    searchTerm: backendSearchTerm,
    searchBy,
  });
  
  // Memoize waitingLists to prevent unnecessary re-renders
  const waitingLists = useMemo(() => {
    return paginatedData?.data ?? [];
  }, [paginatedData?.data]);
  
  const totalRecords = paginatedData?.totalRecords ?? 0;
  const [cityNameMap, setCityNameMap] = useState<Record<string, string>>({});

  // Fetch city names for all unique city IDs using batch endpoint
  useEffect(() => {
    if (!waitingLists || waitingLists.length === 0) return;

    const uniqueCity = new Set<string>();
    for (const item of waitingLists) {
      if (item.city) uniqueCity.add(item.city.trim());
    }

    const cityIds = Array.from(uniqueCity);
    if (cityIds.length === 0) return;

    const fetchAll = async () => {
      try {
        // Use batch endpoint to fetch all cities in one request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch('/api/sys_city/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: cityIds }),
          cache: 'no-store',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          console.warn(`Failed to fetch cities batch: ${res.status}`);
          setCityNameMap({});
          return;
        }
        
        const data = await res.json().catch(() => ({}));
        // Handle both response formats: { data: [...] } or [...]
        const cities = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        
        // Build map from city ID to city name
        const cityMap: Record<string, string> = {};
        for (const city of cities) {
          const id = city?.id?.trim();
          const name = city?.name?.trim();
          if (id && name && name !== id) {
            cityMap[id] = name;
          }
        }
        
        setCityNameMap(cityMap);
      } catch (error: unknown) {
        // Handle network errors, timeouts, etc.
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.warn('Timeout fetching cities batch');
          } else if (error.message?.includes('fetch failed')) {
            console.warn('Network error fetching cities batch:', error.message);
          } else {
            console.warn('Failed to fetch cities batch:', error);
          }
        } else {
          console.warn('Failed to fetch cities batch:', error);
        }
        // Set empty map on failure
        setCityNameMap({});
      }
    };

    void fetchAll();
  }, [waitingLists]);

  const branches: ExtendedBranch[] = useMemo(() => {
    if (!waitingLists) return [];
    const items = waitingLists as WaitingListListItem[];
    return items.map((item) => {
      const typeName =
        Array.isArray(item.workshopTypes) && item.workshopTypes.length > 0
          ? item.workshopTypes[0]?.name ?? null
          : null;
      
      // Get city name: first check if backend already returns cityName (like categoryName)
      // Otherwise try to get from map, or fallback to null
      const cityName = item.cityName || (item.city?.trim() ? (cityNameMap[item.city.trim()] ?? null) : null);

      const b: ExtendedBranch = {
        id: item.id,
        name: item.name,
        city: cityName || null, // Explicitly set to null if no city name
        district: null,
        address: item.address ?? null,
        phone: item.phone ?? item.mobile ?? null,
        logo: item.logo ?? null,
        company: { id: item.categoryId ?? 'UNKNOWN', name: item.categoryName ?? item.name },
        slots: [],
        typeName,
        promoPreview: item.promoPreview ?? null,
        // Pastikan interface WaitingListListItem di-update jika backend sudah mengirim claimStatus
        claimStatus: (item as WaitingListListItem & { claimStatus?: string | null }).claimStatus ?? null,
      };
      return b;
    });
  }, [waitingLists, cityNameMap]);

  // Filtering is now done in backend, but we still need to handle "promo" keyword filtering
  // since backend searchBy doesn't support promo filtering
  const filteredBranches: ExtendedBranch[] = useMemo(() => {
    // If search term contains "promo", filter by promo in frontend
    if (hasPromoKeyword) {
      return branches.filter((b) => {
        const p = b.promoPreview;
        const hasPromo = Boolean(p);
        
        // If only "promo" keyword, show all with promo
        if (isOnlyPromoKeyword) {
          return hasPromo;
        }
        
        // If "promo" + other text, show items with promo that also match the other text
        // Backend already filtered by searchWithoutPromo, so we just need to filter by promo
        return hasPromo;
      });
    }
    
    // Backend already filtered by searchTerm, so just return branches as-is
    return branches;
  }, [branches, hasPromoKeyword, isOnlyPromoKeyword]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPage(1);
    }
  }, [debouncedSearchTerm]);

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <section className={variant === 'section' ? 'w-full bg-white py-12 text-[#2f2f2f]' : 'w-full rounded-3xl bg-background text-[#2f2f2f]'}>
      <div
        className={
          variant === 'section'
            ? 'mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 lg:px-0'
            : 'mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-gray-200 bg-background/95 px-6 py-8 shadow-xl sm:px-10 sm:py-10'
        }
      >
        <header className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-2 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Promo &amp; Bengkel</p>
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Temukan Bengkel Promo di Sekitar Anda</h1>
              <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">Ketik nama bengkel, jenis layanan, atau kata kunci seperti &quot;promo&quot;.</p>
            </div>
            <div className="flex-shrink-0 sm:pt-8">
              <Link
                href="https://workshop.ngebengkel.com/waitinglist-registration"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-gray-50 hover:text-foreground"
              >
                Daftarin Bengkel, Gratis!
              </Link>
            </div>
          </div>
        </header>

        <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingDots text="Memuat daftar bengkel" />
          ) : isError ? (
            <ErrorDisplay
              title="Gagal Memuat Daftar Bengkel"
              message="Maaf, terjadi kesalahan saat memuat daftar bengkel. Silakan coba lagi."
              error={error instanceof Error ? error : error ? String(error) : undefined}
              onRetry={() => {
                void refetch();
              }}
              variant="compact"
              showBackButton={false}
            />
          ) : (
            <>
              <BranchList branches={filteredBranches} />
              {totalRecords > 0 && (
                <div className="border-t border-gray-200 bg-white rounded-lg">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[10, 20, 30]}
                  />
                </div>
              )}
            </>
          )}
        </div>

      
      </div>
    </section>
  );
}

