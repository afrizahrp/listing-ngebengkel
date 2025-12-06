'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';

import { BranchList } from './BranchList';
import { SearchBar } from './SearchBar';
import { SearchSuggestions } from './SearchSuggestions';
import { LoadingDots } from './LoadingDots';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Button } from '@/components/ui/button';
import type { BookingBranch } from '@/types/booking';
import { useWaitingListsPaginated } from '@/queryHooks/useWaitingList';
import { useDebounce } from '@/hooks/useDebounce';
import { Pagination } from '@/components/ui/pagination';
import { useDistrictNamesBatch, useSubdistrictNamesBatch } from '@/queryHooks/useLocationNames';
import { usePainPoint } from '@/queryHooks/usePainPoints';
import { useMatchPainPoint } from '@/queryHooks/useMatchPainPoint';
import { EmptyState } from './EmptyState';
import { PainPointBadge } from './PainPointBadge';
import { useRef } from 'react';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const painPointSlug = searchParams?.get('painPoint') || null;
  const cityNameParam = (searchParams?.get('city') || '').trim();
  
  // Debug: log painPointSlug and searchParams
  useEffect(() => {
    console.log('CTA: painPointSlug =', painPointSlug);
    console.log('CTA: cityNameParam =', cityNameParam);
    console.log('CTA: searchParams =', searchParams?.toString());
    console.log('CTA: painPointSlug exists?', !!painPointSlug);
  }, [painPointSlug, cityNameParam, searchParams]);
  const urlSearchQuery = searchParams?.get('q') || '';
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState<string>(urlSearchQuery);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Fetch pain point jika ada painPoint parameter
  const { data: painPointData } = usePainPoint(painPointSlug, {
    enabled: Boolean(painPointSlug),
  });
  
  // Debug: log painPointData
  useEffect(() => {
    if (painPointData) {
      console.log('CTA: painPointData loaded:', {
        title: painPointData.title,
        workshopTypes: painPointData.workshopTypes,
        serviceTypes: painPointData.serviceTypes,
        keywords: painPointData.keywords,
      });
      console.log('CTA: painPointData.workshopTypes length:', painPointData.workshopTypes?.length || 0);
      console.log('CTA: painPointData.serviceTypes length:', painPointData.serviceTypes?.length || 0);
      console.log('CTA: painPointData.keywords:', painPointData.keywords);
    }
  }, [painPointData]);
  
  // Match search term ke pain point (untuk search bar utama)
  // Send full search term to backend - it will do full-text search
  const { data: matchedPainPoint } = useMatchPainPoint({
    query: debouncedSearchTerm || '',
    debounceMs: 300,
    enabled: (debouncedSearchTerm || '').trim().length > 2 && !painPointSlug, // Hanya jika tidak ada painPoint di URL
  });
  
  // Check if search term is only "promo" keyword
  const normalizedSearch = (debouncedSearchTerm || '').trim().toLowerCase();
  const isOnlyPromoKeyword = normalizedSearch === 'promo';
  const hasPromoKeyword = /\bpromo\b/.test(normalizedSearch);
  const searchWithoutPromo = normalizedSearch.replace(/\bpromo\b/g, '').trim();
  
  // Only fetch location names when user is searching (lazy loading to avoid rate limiting)
  const hasSearchTerm = searchWithoutPromo.length > 0;
  
  // If filtering by pain point, also use frontend pagination
  const needsFrontendPagination = hasSearchTerm || Boolean(painPointSlug);
  
  // If search term is provided, we'll do filtering in frontend (including location-based search)
  // So we don't send searchTerm to backend to allow location filtering
  // Only send to backend if we want to filter by name only (for performance with large datasets)
  // For now, we'll do all filtering in frontend to support location search
  const backendSearchTerm = undefined; // Don't send to backend, filter in frontend instead
  const searchBy = undefined;
  
  // Use larger limit when searching or filtering by pain point to get more data for frontend filtering
  // When no search term or pain point, use normal pagination from backend
  const effectiveLimit = needsFrontendPagination ? Math.max(pageSize, 100) : pageSize;
  const effectivePage = needsFrontendPagination ? 1 : page; // Always fetch from page 1 when filtering, we'll paginate in frontend
  
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

  // Get unique district and subdistrict IDs (only when searching or filtering by pain point)
  const { uniqueDistrictIds, uniqueSubdistrictIds } = useMemo(() => {
    if (!needsFrontendPagination || !waitingLists || waitingLists.length === 0) {
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
  }, [waitingLists, needsFrontendPagination]);

  // Fetch district and subdistrict names using React Query batch hooks with caching
  const { data: districtNameMap = {}, isLoading: isDistrictLoading } = useDistrictNamesBatch(
    uniqueDistrictIds,
    { enabled: needsFrontendPagination && uniqueDistrictIds.length > 0 }
  );

  const { data: subdistrictNameMap = {}, isLoading: isSubdistrictLoading } = useSubdistrictNamesBatch(
    uniqueSubdistrictIds,
    { enabled: needsFrontendPagination && uniqueSubdistrictIds.length > 0 }
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

  // Filtering: handle location-based search (city, district, subdistrict), promo keyword, and pain point
  const filteredBranches: ExtendedBranch[] = useMemo(() => {
    let filtered = branches;
    
    // Filter by city name if provided in URL query param
    if (cityNameParam) {
      filtered = filtered.filter((b) => {
        const branchCity = b.city?.trim().toLowerCase();
        const targetCity = cityNameParam.toLowerCase();
        return branchCity === targetCity;
      });
    }
    
    // Determine which pain point to use: URL parameter OR matched from search
    const activePainPoint = painPointSlug && painPointData 
      ? painPointData 
      : matchedPainPoint?.painPoint 
        ? {
            ...matchedPainPoint.painPoint,
            keywords: matchedPainPoint.matchedKeywords,
            serviceTypes: matchedPainPoint.serviceTypes,
          }
        : null;
    
    // Filter by pain point (if painPoint parameter exists OR matched from search)
    if (activePainPoint) {
      // Get service type names from pain point (jika ada)
      const relevantServiceTypeNames =
        activePainPoint.serviceTypes?.map((st: { name: string }) => st.name.toLowerCase()) || [];
      
      // Get workshop type names from pain point (jika ada) - PENTING untuk waitingList
      const relevantWorkshopTypeNames =
        activePainPoint.workshopTypes?.map((wt: { name: string }) => wt.name.toLowerCase()) || [];
      
      // Debug logging
      console.log('CTA: Filtering with pain point:', activePainPoint.title);
      console.log('CTA: relevantWorkshopTypeNames:', relevantWorkshopTypeNames);
      console.log('CTA: relevantServiceTypeNames:', relevantServiceTypeNames);
      console.log('CTA: Total branches before filter:', branches.length);
      console.log('CTA: Sample branch typeName:', branches[0]?.typeName);
      
      // Get keywords dari pain point untuk broader matching
      const painPointKeywords = activePainPoint.keywords || [];
      const painPointTitleLower = activePainPoint.title?.toLowerCase() || '';
      
      // Extract key terms dari title (contoh: "AC tidak dingin" -> ["ac", "dingin", "pendingin"])
      // Tambahkan sinonim untuk matching yang lebih baik
      const titleTerms = painPointTitleLower
        .split(/\s+/)
        .filter((term: string) => term.length > 1 && !['tidak', 'yang', 'pada', 'dari', 'ada', 'ini', 'atau'].includes(term));
      
      // Tambahkan sinonim untuk AC dan masalah umum - lebih lengkap
      const synonyms: Record<string, string[]> = {
        'ac': ['ac', 'air conditioner', 'pendingin', 'cooling', 'a/c', 'aircon', 'air-conditioner', 'freon', 'evaporator', 'kompresor'],
        'dingin': ['dingin', 'cool', 'pendingin', 'cooling', 'sejuk'],
        'tidak': ['tidak', 'tidak', 'kurang'],
        'rem': ['rem', 'brake', 'pengereman'],
        'mesin': ['mesin', 'engine', 'motor'],
        'body': ['body', 'cat', 'catting', 'dempul'],
        'suspensi': ['suspensi', 'suspension', 'shockbreaker', 'shock'],
        'spesialis': ['spesialis', 'specialist', 'ahli'],
      };
      
      // Expand terms dengan sinonim
      const expandedTerms = new Set<string>();
      titleTerms.forEach((term: string) => {
        const termLower = term.toLowerCase().trim();
        if (termLower.length > 1) {
          expandedTerms.add(termLower);
          // Tambahkan sinonim
          if (synonyms[termLower]) {
            synonyms[termLower].forEach((syn) => expandedTerms.add(syn));
          }
          // Juga cek apakah term adalah bagian dari key synonym
          Object.keys(synonyms).forEach((key) => {
            if (termLower.includes(key) || key.includes(termLower)) {
              synonyms[key].forEach((syn) => expandedTerms.add(syn));
            }
          });
        }
      });
      
      // Tambahkan keywords ke expanded terms
      painPointKeywords.forEach((keyword: string) => {
        const keywordLower = keyword.toLowerCase().trim();
        if (keywordLower.length > 1) {
          expandedTerms.add(keywordLower);
          // Juga tambahkan sinonim untuk keywords
          Object.keys(synonyms).forEach((key) => {
            if (keywordLower.includes(key) || key.includes(keywordLower)) {
              synonyms[key].forEach((syn) => expandedTerms.add(syn));
            }
          });
        }
      });
      
      // Tambahkan terms khusus untuk AC: "spesialis ac mobil" harus match dengan "ac tidak dingin"
      if (painPointTitleLower.includes('ac') || painPointTitleLower.includes('dingin')) {
        expandedTerms.add('spesialis');
        expandedTerms.add('mobil');
        expandedTerms.add('ac mobil');
        expandedTerms.add('spesialis ac');
        expandedTerms.add('spesialis ac mobil');
      }
      
      console.log('CTA: expandedTerms:', Array.from(expandedTerms));
      console.log('CTA: painPointKeywords:', painPointKeywords);
      console.log('CTA: titleTerms:', titleTerms);
      
      // Check if this is an AC-related pain point
      const isAcRelated = painPointTitleLower.includes('ac') || 
                         painPointTitleLower.includes('dingin') ||
                         painPointKeywords.some((k: string) => k.toLowerCase().includes('ac') || k.toLowerCase().includes('pendingin'));
      
      filtered = branches.filter((b) => {
        const typeNameLower = b.typeName?.toLowerCase() || '';
        const nameLower = b.name?.toLowerCase() || '';
        
        // For AC-related pain points, require AC/pendingin in typeName
        if (isAcRelated) {
          const hasAcInTypeName = typeNameLower.includes('ac') || typeNameLower.includes('pendingin');
          if (!hasAcInTypeName) {
            // Skip this branch if it doesn't have AC/pendingin in typeName
            return false;
          }
        }
        
        // 1. Match berdasarkan workshop types (PRIORITAS - untuk waitingList)
        if (relevantWorkshopTypeNames.length > 0) {
          const matchesWorkshopType = relevantWorkshopTypeNames.some((workshopTypeName: string) => {
            // Exact match atau partial match
            const match = (
              typeNameLower === workshopTypeName ||
              typeNameLower.includes(workshopTypeName) ||
              workshopTypeName.includes(typeNameLower) ||
              // Match per kata: "spesialis ac mobil" match dengan "ac"
              typeNameLower.split(/\s+/).some((word: string) => 
                word.includes(workshopTypeName) || 
                workshopTypeName.includes(word) || 
                word === workshopTypeName
              )
            );
            if (match) {
              console.log(`CTA: Match found! Branch "${b.name}" (typeName: "${b.typeName}") matches workshopType "${workshopTypeName}"`);
            }
            return match;
          });
          if (matchesWorkshopType) return true;
        }
        
        // 2. Match berdasarkan service types (jika ada)
        if (relevantServiceTypeNames.length > 0) {
          const matchesServiceType = relevantServiceTypeNames.some((serviceTypeName: string) =>
            typeNameLower.includes(serviceTypeName) || serviceTypeName.includes(typeNameLower),
          );
          if (matchesServiceType) return true;
        }
        
        // 3. Match berdasarkan keywords dari pain point (lebih longgar)
        const matchesKeywords = painPointKeywords.some((keyword: string) => {
          const keywordLower = keyword.toLowerCase().trim();
          if (keywordLower.length < 2) return false;
          
          // Exact match atau partial match
          const match = (
            typeNameLower.includes(keywordLower) ||
            nameLower.includes(keywordLower) ||
            keywordLower.includes(typeNameLower) ||
            // Match per kata: "ac" match dengan "spesialis ac mobil"
            typeNameLower.split(/\s+/).some((word: string) => {
              const wordLower = word.toLowerCase().trim();
              return (
                wordLower.includes(keywordLower) || 
                keywordLower.includes(wordLower) ||
                wordLower === keywordLower
              );
            }) ||
            nameLower.split(/\s+/).some((word: string) => {
              const wordLower = word.toLowerCase().trim();
              return (
                wordLower.includes(keywordLower) || 
                keywordLower.includes(wordLower) ||
                wordLower === keywordLower
              );
            })
          );
          
          if (match) {
            console.log(`CTA: Keyword match! Branch "${b.name}" (typeName: "${b.typeName}") matches keyword "${keyword}"`);
          }
          return match;
        });
        if (matchesKeywords) return true;
        
        // 4. Match berdasarkan expanded title terms (dengan sinonim) - lebih spesifik
        const matchesExpandedTerms = Array.from(expandedTerms).some((term: string) => {
          if (term.length < 2) return false;
          const termLower = term.toLowerCase().trim();
          
          // Skip terms yang terlalu umum untuk AC (spesialis, mobil, dll)
          const skipTerms = ['spesialis', 'mobil', 'motor', 'umum', 'bengkel'];
          if (skipTerms.includes(termLower)) {
            // Hanya match jika ada term AC/pendingin juga
            const hasAcTerm = Array.from(expandedTerms).some((t: string) => {
              const tLower = t.toLowerCase().trim();
              return (tLower === 'ac' || tLower.includes('ac') || tLower === 'pendingin' || tLower.includes('pendingin')) &&
                     (typeNameLower.includes('ac') || typeNameLower.includes('pendingin'));
            });
            if (!hasAcTerm) return false;
          }
          
          // Special handling untuk "ac" - harus match dengan typeName yang mengandung "ac" atau "pendingin"
          if (termLower === 'ac' || termLower.includes('ac') || termLower === 'pendingin' || termLower.includes('pendingin')) {
            // Match jika typeName mengandung "ac" atau "pendingin"
            if (typeNameLower.includes('ac') || typeNameLower.includes('pendingin')) {
              console.log(`CTA: AC match! Branch "${b.name}" (typeName: "${b.typeName}") matches AC term "${term}"`);
              return true;
            }
          }
          
          // Untuk terms lain, hanya match jika bukan skip terms
          if (skipTerms.includes(termLower)) {
            return false;
          }
          
          const match = (
            typeNameLower.includes(termLower) ||
            nameLower.includes(termLower) ||
            termLower.includes(typeNameLower) ||
            termLower.includes(nameLower) ||
            // Match per kata: "ac" match dengan "spesialis ac mobil"
            typeNameLower.split(/\s+/).some((word: string) => {
              const wordLower = word.toLowerCase().trim();
              return (
                wordLower.includes(termLower) || 
                termLower.includes(wordLower) || 
                wordLower === termLower
              );
            }) ||
            nameLower.split(/\s+/).some((word: string) => {
              const wordLower = word.toLowerCase().trim();
              return (
                wordLower.includes(termLower) || 
                termLower.includes(wordLower) || 
                wordLower === termLower
              );
            })
          );
          
          if (match) {
            console.log(`CTA: Expanded term match! Branch "${b.name}" (typeName: "${b.typeName}") matches term "${term}"`);
          }
          return match;
        });
        if (matchesExpandedTerms) return true;
        
        // 5. Match berdasarkan pain point title langsung (fallback terakhir)
        if (painPointTitleLower) {
          // Extract key words dari title untuk matching yang lebih flexible
          const titleWords = painPointTitleLower.split(/\s+/).filter((w: string) => w.length > 1 && !['tidak', 'yang', 'pada', 'dari', 'ada', 'ini'].includes(w));
          
          // Special case untuk AC: jika title mengandung "ac" atau "dingin", match dengan typeName yang mengandung "ac" atau "pendingin"
          if (painPointTitleLower.includes('ac') || painPointTitleLower.includes('dingin')) {
            if (typeNameLower.includes('ac') || typeNameLower.includes('pendingin') || typeNameLower.includes('spesialis ac')) {
              console.log(`CTA: AC title match! Branch "${b.name}" (typeName: "${b.typeName}") matches AC title "${painPointTitleLower}"`);
              return true;
            }
          }
          
          const matchesTitleWords = titleWords.some((word: string) => {
            const wordLower = word.toLowerCase().trim();
            const match = (
              typeNameLower.includes(wordLower) || 
              nameLower.includes(wordLower) ||
              wordLower.includes(typeNameLower) ||
              wordLower.includes(nameLower)
            );
            if (match) {
              console.log(`CTA: Title word match! Branch "${b.name}" (typeName: "${b.typeName}") matches word "${word}"`);
            }
            return match;
          });
          if (matchesTitleWords) return true;
        }
        
        return false;
      });
      
      console.log('CTA: Total branches after filter:', filtered.length);
      if (filtered.length === 0) {
        console.log('CTA: No matches found. Sample branches:', branches.slice(0, 3).map(b => ({
          name: b.name,
          typeName: b.typeName,
        })));
      }
    }
    
    // Apply search filtering (name, city, district, subdistrict)
    // Only apply text search filtering if pain point was successfully matched
    // Otherwise, show all results (pain point keywords will be used for matching if available)
    const searchLower = searchWithoutPromo.toLowerCase().trim();
    
    // Only do text-based filtering if:
    // 1. There's no pain point being filtered, AND
    // 2. Search term is provided, AND
    // 3. It's not just the promo keyword
    if (!activePainPoint && searchLower.length > 0 && !isOnlyPromoKeyword) {
      // Text search only applies to location fields, not to service types
      // So only filter if search contains actual location keywords
      const locationKeywords = searchLower.split(/\s+/);
      const hasLocationKeyword = locationKeywords.some(keyword => {
        // These are common location keywords - if search contains these, do location filtering
        const locationIndicators = ['jakarta', 'bandung', 'surabaya', 'utara', 'selatan', 'timur', 'barat', 'pusat', 'tengah', 'jalan', 'jl', 'kota', 'kec', 'kel', 'desa'];
        return locationIndicators.some(indicator => keyword.includes(indicator) || indicator.includes(keyword));
      });
      
      // Only apply location filtering if search seems to contain location terms
      if (hasLocationKeyword) {
        filtered = filtered.filter((b) => {
          const nameMatch = b.name?.toLowerCase().includes(searchLower) ?? false;
          const cityMatch = b.city?.toLowerCase().includes(searchLower) ?? false;
          const districtMatch = b.district?.toLowerCase().includes(searchLower) ?? false;
          const subdistrictMatch = (b as ExtendedBranch & { subdistrict?: string | null }).subdistrict?.toLowerCase().includes(searchLower) ?? false;
          
          return nameMatch || cityMatch || districtMatch || subdistrictMatch;
        });
      }
      // If search doesn't seem to contain location keywords, don't filter - just show all
      // (user might be typing service keywords that didn't match any pain point)
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
  }, [branches, cityNameParam, hasPromoKeyword, isOnlyPromoKeyword, searchWithoutPromo, sortOption, painPointSlug, painPointData, matchedPainPoint]);
  
  // Paginate filtered results in frontend (when searching or filtering by pain point)
  // When not filtering, use backend pagination
  const paginatedFilteredBranches = useMemo(() => {
    if (needsFrontendPagination) {
      // Frontend pagination when searching or filtering by pain point
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return filteredBranches.slice(startIndex, endIndex);
    } else {
      // Use backend pagination when not filtering
      return filteredBranches;
    }
  }, [filteredBranches, page, pageSize, needsFrontendPagination]);
  
  // Calculate total pages based on filtered results (when filtering) or backend total (when not filtering)
  const totalFilteredRecords = needsFrontendPagination ? filteredBranches.length : totalRecords;
  const totalPages = needsFrontendPagination 
    ? Math.ceil(filteredBranches.length / pageSize)
    : Math.ceil(totalRecords / pageSize);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPage(1);
    }
  }, [debouncedSearchTerm]);

  // Sync searchTerm dengan URL query parameter (hanya saat URL berubah, bukan saat searchTerm berubah)
  useEffect(() => {
    if (urlSearchQuery !== searchTerm) {
      setSearchTerm(urlSearchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearchQuery]);

  // Reset page when painPoint changes
  useEffect(() => {
    if (painPointSlug) {
      setPage(1);
    }
  }, [painPointSlug]);

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
          {painPointSlug && (
            <div className="mb-4 -mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Back button clicked, painPointSlug:', painPointSlug);
                  // Remove painPoint parameter and navigate back
                  const newParams = new URLSearchParams(searchParams?.toString() || '');
                  newParams.delete('painPoint');
                  const newQuery = newParams.toString();
                  const newUrl = newQuery ? `/bengkel?${newQuery}` : '/bengkel';
                  console.log('Navigating to:', newUrl);
                  router.push(newUrl);
                }}
                className="inline-flex items-center gap-2 border-2 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali ke Listing</span>
              </Button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-2 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {painPointData ? 'Solusi Bengkel' : 'Promo & Bengkel'}
              </p>
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                {painPointData
                  ? `Bengkel untuk "${painPointData.title}"`
                  : 'Temukan Bengkel Promo di Sekitar Kamu'}
              </h2>
              <p className="max-w-md text-base text-muted-foreground sm:text-sm sm:whitespace-nowrap">
                {painPointData
                  ? painPointData.description || `Temukan bengkel terpercaya untuk mengatasi masalah "${painPointData.title}".`
                  : 'Ketik nama bengkel, kota, kecamatan, kelurahan, atau kata kunci seperti "promo".'}
              </p>
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
          <div className="relative">
            <SearchBar
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setSuggestionsOpen(value.trim().length >= 2);
              }}
              onFocus={() => setSuggestionsOpen(searchTerm.trim().length >= 2)}
              onBlur={() => {
                // Delay closing to allow click events on suggestions to complete
                setTimeout(() => {
                  // Check if suggestions are still being interacted with
                  const activeElement = document.activeElement as HTMLElement;
                  if (activeElement && activeElement.closest('#search-suggestions')) {
                    return;
                  }
                  setSuggestionsOpen(false);
                }, 300);
              }}
              suggestionsOpen={suggestionsOpen}
              ariaLabel="Cari nama bengkel atau masalah kendaraan"
              ariaDescribedBy="search-suggestions-description-cta"
              placeholder="Cari nama bengkel, kota, atau masalah kendaraan..."
              inputRef={searchInputRef}
            />
            <div id="search-suggestions-description-cta" className="sr-only">
              Gunakan tombol panah atas dan bawah untuk navigasi, Enter untuk memilih, Escape untuk menutup
            </div>
            <SearchSuggestions
              query={searchTerm}
              onSelect={(slug) => {
                console.log('CTA: onSelect called with slug:', slug);
                // Langsung navigate ke listing dengan pain point slug
                const url = `/bengkel?painPoint=${slug}`;
                console.log('CTA: Navigating to:', url);
                // Use window.location for more reliable navigation
                window.location.href = url;
                setSuggestionsOpen(false);
              }}
              className="mt-1"
              inputRef={searchInputRef}
            />
            {matchedPainPoint && !painPointSlug && (
              <div className="mt-2">
                <PainPointBadge
                  title={matchedPainPoint.painPoint.title}
                  confidence={matchedPainPoint.confidence}
                  matchedKeywords={matchedPainPoint.matchedKeywords}
                  onDismiss={() => {
                    // Clear search untuk dismiss match
                    setSearchTerm('');
                  }}
                />
              </div>
            )}
          </div>
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
              {paginatedFilteredBranches.length === 0 ? (
                <EmptyState
                  title={
                    painPointData
                      ? `Tidak ada bengkel yang menangani "${painPointData.title}"`
                      : 'Tidak ada bengkel yang ditemukan'
                  }
                  description={
                    painPointData
                      ? 'Coba pilih kota lain atau cari masalah kendaraan lainnya.'
                      : 'Coba pilih kota lain atau sesuaikan kata kunci pencarian.'
                  }
                  showPainPointSuggestions={!painPointData}
                />
              ) : (
                <BranchList branches={paginatedFilteredBranches} />
              )}
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

