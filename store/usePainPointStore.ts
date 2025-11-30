import { create } from 'zustand';
import type { PainPoint, PainPointMatchResult } from '@/queryHooks/usePainPoints';

/**
 * Zustand store untuk pain point state management
 * 
 * Digunakan untuk:
 * - Store selected pain point
 * - Store search query
 * - Store matched pain point
 * - Share state antar components
 */
interface PainPointState {
  // Selected pain point (dari URL atau user selection)
  selectedPainPoint: PainPoint | null;
  setSelectedPainPoint: (painPoint: PainPoint | null) => void;

  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Matched pain point (hasil dari matching)
  matchedPainPoint: PainPointMatchResult | null;
  setMatchedPainPoint: (match: PainPointMatchResult | null) => void;

  // Clear all state
  clearState: () => void;
}

export const usePainPointStore = create<PainPointState>((set) => ({
  selectedPainPoint: null,
  setSelectedPainPoint: (painPoint) => set({ selectedPainPoint: painPoint }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  matchedPainPoint: null,
  setMatchedPainPoint: (match) => set({ matchedPainPoint: match }),

  clearState: () =>
    set({
      selectedPainPoint: null,
      searchQuery: '',
      matchedPainPoint: null,
    }),
}));



