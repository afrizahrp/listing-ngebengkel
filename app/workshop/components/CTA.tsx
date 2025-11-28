'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import { BranchList } from './BranchList';
import { SearchBar } from './SearchBar';
import { LoadingDots } from './LoadingDots';
import { ErrorDisplay } from '@/components/ui/error-display';
import type { BookingBranch } from '@/types/booking';
import { useWaitingListsPaginated } from '@/queryHooks/useWaitingList';
import { useDebounce } from '@/hooks/useDebounce';
import { Pagination } from '@/components/ui/pagination';
import { useDistrictNamesBatch, useSubdistrictNamesBatch } from '@/queryHooks/useLocationNames';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CTAVariant = 'section' | 'dialog';

interface WaitingListListItem {
  id: string;
  name: string;
  slug?: string | null; // Slug dari database (sudah pasti terisi di wks_waitingList)
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
  subdistrict?: string | null;
  workshopTypes?: Array<{ id: string; name: string | null }>;
  promoPreview?: {
    id: string;
    title: string;
    promoType: string;
    checklist?: string[] | null;
  } | null;
  isPromoLinked?: boolean;
}

interface ExtendedBranch extends BookingBranch {
  typeName?: string | null;
  promoPreview?: WaitingListListItem['promoPreview'];
  claimStatus?: string | null;
  isPromoLinked?: boolean;
}

type SortOption = 'name-asc' | 'name-desc';

export function CTA({ variant = 'section' }: { variant?: CTAVariant }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Check if search term is only "promo" keyword
  const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();
  const isOnlyPromoKeyword = normalizedSearch === 'promo';
  const hasPromoKeyword = /\bpromo\b/.test(normalizedSearch);
  const searchWithoutPromo = normalizedSearch.replace(/\bpromo\b/g, '').trim();
  
  // Only fetch location names when user is searching (lazy loading to avoid rate limiting)
  const hasSearchTerm = searchWithoutPromo.length > 0;
  
  // If search term is provided, we'll do filtering in frontend (including location-based search)
  // So we don't send searchTerm to backend to allow location filtering
  // Only send to backend if we want to filter by name only (for performance with large datasets)
  // For now, we'll do all filtering in frontend to support location search
  const backendSearchTerm = undefined; // Don't send to backend, filter in frontend instead
  const searchBy = undefined;
  
  // Use larger limit when searching to get more data for frontend filtering
  // When no search term, use normal pagination from backend
  const effectiveLimit = hasSearchTerm ? Math.max(pageSize, 100) : pageSize;
  const effectivePage = hasSearchTerm ? 1 : page; // Always fetch from page 1 when searching, we'll paginate in frontend
  
  const { data: paginatedData, isLoading, isError, error, refetch } = useWaitingListsPaginated({
    page: effectivePage,
    limit: effectiveLimit,
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

  // Get unique district and subdistrict IDs (only when searching)
  const { uniqueDistrictIds, uniqueSubdistrictIds } = useMemo(() => {
    if (!hasSearchTerm || !waitingLists || waitingLists.length === 0) {
      return { uniqueDistrictIds: [], uniqueSubdistrictIds: [] };
    }

    const districtSet = new Set<string>();
    const subdistrictSet = new Set<string>();
    
    for (const item of waitingLists) {
      if (item.district?.trim()) {
        districtSet.add(item.district.trim());
      }
      if (item.subdistrict?.trim()) {
        subdistrictSet.add(item.subdistrict.trim());
      }
    }

    return {
      uniqueDistrictIds: Array.from(districtSet),
      uniqueSubdistrictIds: Array.from(subdistrictSet),
    };
  }, [waitingLists, hasSearchTerm]);

  // Fetch district and subdistrict names using React Query batch hooks with caching
  const { data: districtNameMap = {}, isLoading: isDistrictLoading } = useDistrictNamesBatch(
    uniqueDistrictIds,
    { enabled: hasSearchTerm && uniqueDistrictIds.length > 0 }
  );

  const { data: subdistrictNameMap = {}, isLoading: isSubdistrictLoading } = useSubdistrictNamesBatch(
    uniqueSubdistrictIds,
    { enabled: hasSearchTerm && uniqueSubdistrictIds.length > 0 }
  );

  const isLocationQueriesLoading = isDistrictLoading || isSubdistrictLoading;

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
      
      // Get district name from map
      const districtName = item.district?.trim() ? (districtNameMap[item.district.trim()] ?? null) : null;
      
      // Get subdistrict name from map
      const subdistrictName = item.subdistrict?.trim() ? (subdistrictNameMap[item.subdistrict.trim()] ?? null) : null;

      const b: ExtendedBranch = {
        id: item.id,
        name: item.name,
        slug: item.slug ?? null, // Slug dari database (sudah pasti terisi)
        city: cityName || null, // Explicitly set to null if no city name
        district: districtName || null,
        address: item.address ?? null,
        phone: item.phone ?? item.mobile ?? null,
        logo: item.logo ?? null,
        company: { id: item.categoryId ?? 'UNKNOWN', name: item.categoryName ?? item.name },
        slots: [],
        typeName,
        promoPreview: item.promoPreview ?? null,
        // Pastikan interface WaitingListListItem di-update jika backend sudah mengirim claimStatus
        claimStatus: (item as WaitingListListItem & { claimStatus?: string | null }).claimStatus ?? null,
        // Store location names for filtering
        subdistrict: subdistrictName || null,
        // Include isPromoLinked dari backend (penting untuk sorting)
        isPromoLinked: item.isPromoLinked ?? false,
      } as ExtendedBranch & { subdistrict?: string | null };
      return b;
    });
  }, [waitingLists, cityNameMap, districtNameMap, subdistrictNameMap]);

  // Filtering: handle location-based search (city, district, subdistrict) and promo keyword
  const filteredBranches: ExtendedBranch[] = useMemo(() => {
    let filtered = branches;
    
    // Apply search filtering (name, city, district, subdistrict)
    const searchLower = searchWithoutPromo.toLowerCase().trim();
    if (searchLower.length > 0 && !isOnlyPromoKeyword) {
      filtered = branches.filter((b) => {
        // Check if search term matches name, city, district, or subdistrict
        const nameMatch = b.name?.toLowerCase().includes(searchLower) ?? false;
        const cityMatch = b.city?.toLowerCase().includes(searchLower) ?? false;
        const districtMatch = b.district?.toLowerCase().includes(searchLower) ?? false;
        const subdistrictMatch = (b as ExtendedBranch & { subdistrict?: string | null }).subdistrict?.toLowerCase().includes(searchLower) ?? false;
        
        return nameMatch || cityMatch || districtMatch || subdistrictMatch;
      });
    }
    
    // If search term contains "promo", filter by promo in frontend
    if (hasPromoKeyword) {
      filtered = filtered.filter((b) => {
        const p = b.promoPreview;
        const hasPromo = Boolean(p);
        
        // If only "promo" keyword, show all with promo
        if (isOnlyPromoKeyword) {
          return hasPromo;
        }
        
        // If "promo" + other text, show items with promo that also match the other text
        return hasPromo;
      });
    }
    
    // Apply sorting
    // PENTING: Item dengan isPromoLinked = true SELALU di atas dan di-sort alfabetis (A-Z)
    // Konsisten dengan backend: gunakan localeCompare langsung tanpa toLowerCase
    const sorted = [...filtered];
    
    // Pisahkan item dengan isPromoLinked = true (promo) dan yang tidak (regular)
    const promoLinked = sorted.filter((b) => b.isPromoLinked === true);
    const regular = sorted.filter((b) => b.isPromoLinked !== true);
    
    // Sort promo linked items alphabetically (A-Z) - SELALU di atas
    // Konsisten dengan backend: gunakan localeCompare langsung (tanpa toLowerCase)
    promoLinked.sort((a, b) => {
      const nameA = (a.name || '').trim();
      const nameB = (b.name || '').trim();
      return nameA.localeCompare(nameB, 'id', { sensitivity: 'base', numeric: true });
    });
    
    // Sort regular items sesuai option yang dipilih
    if (sortOption === 'name-asc') {
      regular.sort((a, b) => {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        return nameA.localeCompare(nameB, 'id', { sensitivity: 'base', numeric: true });
      });
    } else if (sortOption === 'name-desc') {
      regular.sort((a, b) => {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        return nameB.localeCompare(nameA, 'id', { sensitivity: 'base', numeric: true });
      });
    } else {
      // Default: sort alphabetically ascending
      regular.sort((a, b) => {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        return nameA.localeCompare(nameB, 'id', { sensitivity: 'base', numeric: true });
      });
    }
    
    // Gabungkan: promo linked di atas (selalu A-Z), regular di bawah (sesuai sort option)
    return [...promoLinked, ...regular];
  }, [branches, hasPromoKeyword, isOnlyPromoKeyword, searchWithoutPromo, sortOption]);
  
  // Paginate filtered results in frontend (only when searching)
  // When not searching, use backend pagination
  const paginatedFilteredBranches = useMemo(() => {
    if (hasSearchTerm) {
      // Frontend pagination when searching
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return filteredBranches.slice(startIndex, endIndex);
    } else {
      // Use backend pagination when not searching
      return filteredBranches;
    }
  }, [filteredBranches, page, pageSize, hasSearchTerm]);
  
  // Calculate total pages based on filtered results (when searching) or backend total (when not searching)
  const totalFilteredRecords = hasSearchTerm ? filteredBranches.length : totalRecords;
  const totalPages = hasSearchTerm 
    ? Math.ceil(filteredBranches.length / pageSize)
    : Math.ceil(totalRecords / pageSize);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPage(1);
    }
  }, [debouncedSearchTerm]);

  // Reset to page 1 when sort option changes
  useEffect(() => {
    setPage(1);
  }, [sortOption]);

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

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
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Temukan Bengkel Promo di Sekitar Anda</h2>
              <p className="max-w-md text-base text-muted-foreground sm:text-sm sm:whitespace-nowrap">Ketik nama bengkel, kota, kecamatan, kelurahan, atau kata kunci seperti &quot;promo&quot;.</p>
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

        {/* Sort Control */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {totalFilteredRecords > 0 ? (
              <span>
                Menampilkan <span className="font-semibold text-foreground">{paginatedFilteredBranches.length}</span> dari{' '}
                <span className="font-semibold text-foreground">{totalFilteredRecords}</span> bengkel
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-muted-foreground whitespace-nowrap">
              Urutkan:
            </label>
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger
                id="sort-select"
                className="w-[200px] h-9 text-sm"
                icon={<ArrowUpDown className="h-4 w-4" />}
              >
                <SelectValue>
                  {sortOption === 'name-asc' && (
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      <span>Nama A-Z</span>
                    </div>
                  )}
                  {sortOption === 'name-desc' && (
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      <span>Nama Z-A</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    <span>Nama A-Z</span>
                  </div>
                </SelectItem>
                <SelectItem value="name-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    <span>Nama Z-A</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              {isLocationQueriesLoading && hasSearchTerm ? (
                <LoadingDots text="Memuat informasi lokasi..." />
              ) : null}
              <BranchList branches={paginatedFilteredBranches} />
              {totalFilteredRecords > 0 && (
                <div className="border-t border-gray-200 bg-white rounded-lg">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalRecords={totalFilteredRecords}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[12, 24, 36]}
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

