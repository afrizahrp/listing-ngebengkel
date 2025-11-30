'use client';

import { useEffect } from 'react';
import { useMatchPainPoint } from '@/queryHooks/useMatchPainPoint';
import { usePainPointStore } from '@/store/usePainPointStore';
import { PainPointBadge } from './PainPointBadge';

type PainPointMatcherProps = {
  query: string;
  onMatch?: (matched: boolean) => void;
  showBadge?: boolean;
  className?: string;
};

/**
 * Component untuk match query ke pain point
 * 
 * Features:
 * - Auto-match query dengan debounce
 * - Update Zustand store dengan matched pain point
 * - Show badge jika match ditemukan
 */
export function PainPointMatcher({
  query,
  onMatch,
  showBadge = true,
  className,
}: PainPointMatcherProps) {
  const { setMatchedPainPoint } = usePainPointStore();
  const { data: match, isLoading, error } = useMatchPainPoint({
    query: query || '',
    debounceMs: 300,
    enabled: (query || '').trim().length > 0,
  });

  useEffect(() => {
    if (match) {
      setMatchedPainPoint(match);
      onMatch?.(true);
    } else {
      setMatchedPainPoint(null);
      onMatch?.(false);
    }
  }, [match, setMatchedPainPoint, onMatch]);

  // Log errors in development
  useEffect(() => {
    if (error && process.env.NODE_ENV === 'development') {
      console.error('PainPointMatcher error:', error);
    }
  }, [error]);

  if (!showBadge || !match || isLoading) {
    return null;
  }

  return (
    <div className={className}>
      <PainPointBadge
        title={match.painPoint.title}
        confidence={match.confidence}
        matchedKeywords={match.matchedKeywords}
      />
    </div>
  );
}


