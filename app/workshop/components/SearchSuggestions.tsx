'use client';

import { Card } from '@/components/ui/card';
import { Wrench, Loader2 } from 'lucide-react';
import { usePainPointSuggestions } from '@/queryHooks/usePainPointSuggestions';
import { useRef, useEffect, useState, useCallback } from 'react';
import type { PainPointSearchResult } from '@/queryHooks/usePainPoints';
import { cn } from '@/lib/utils';

type SearchSuggestionsProps = {
  query: string;
  onSelect?: (suggestion: string) => void;
  className?: string;
  minLength?: number;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
};

export function SearchSuggestions({
  query,
  onSelect,
  className,
  minLength = 2,
  onKeyDown,
  inputRef,
}: SearchSuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const isClickingRef = useRef(false);
  const { data: suggestions, isLoading } = usePainPointSuggestions({
    query,
    minLength,
    enabled: query.trim().length >= minLength,
  });

  const handleSelect = useCallback((result: PainPointSearchResult) => {
    if (!result?.painPoint?.slug) {
      console.warn('Invalid pain point result:', result);
      return;
    }
    
    // Prevent multiple calls
    if (isClickingRef.current) {
      console.log('Already clicking, ignoring...');
      return;
    }
    
    isClickingRef.current = true;
    setSelectedIndex(-1);
    
    const slug = result.painPoint.slug;
    
    console.log('handleSelect: Navigating to pain point:', slug);
    
    // Navigate immediately - use window.location for more reliable navigation
    if (onSelect) {
      // Pass slug for navigation
      console.log('handleSelect: Calling onSelect with slug:', slug);
      try {
        onSelect(slug);
      } catch (error) {
        console.error('handleSelect: Error calling onSelect:', error);
        // Fallback to direct navigation
        window.location.href = `/bengkel?painPoint=${slug}`;
      }
    } else {
      // Default: navigate ke listing dengan pain point
      const url = `/bengkel?painPoint=${slug}`;
      console.log('handleSelect: Navigating to:', url);
      // Use window.location for more reliable navigation
      window.location.href = url;
    }
    
    // Reset flag after a moment
    setTimeout(() => {
      isClickingRef.current = false;
    }, 1000);
  }, [onSelect]);

  // Reset selected index saat suggestions berubah
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!inputRef?.current) return;
    // Only add listener when suggestions exist and are available
    if (!suggestions || suggestions.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle navigation keys, let other keys pass through for normal typing
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            event.preventDefault();
            event.stopPropagation();
            handleSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
        default:
          // Let all other keys pass through for normal typing
          return;
      }
    };

    const input = inputRef.current;
    // Use capture phase to ensure we can prevent default if needed, but only for specific keys
    input.addEventListener('keydown', handleKeyDown, false);
    return () => input.removeEventListener('keydown', handleKeyDown, false);
  }, [suggestions, selectedIndex, inputRef, handleSelect]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && containerRef.current) {
      const selectedElement = containerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Don't close if clicking inside suggestions or input
      if (
        containerRef.current?.contains(target) ||
        inputRef?.current?.contains(target)
      ) {
        return;
      }
      // Close suggestions if clicking outside
      setSelectedIndex(-1);
    }

    if (suggestions && suggestions.length > 0) {
      // Use click event with delay to allow button clicks to complete first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 200);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [suggestions, inputRef]);

  if (!query || query.trim().length < minLength) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        ref={containerRef}
        id="search-suggestions"
        role="listbox"
        aria-label="Saran pencarian"
        className={cn('relative z-50', className)}
      >
        <Card className="absolute top-2 left-0 right-0 shadow-lg border border-gray-200 bg-white">
          <div className="p-4 flex items-center justify-center gap-2" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Mencari...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      id="search-suggestions"
      role="listbox"
      aria-label="Saran pencarian"
      aria-expanded="true"
      className={cn('relative z-50', className)}
    >
      <Card className="absolute top-2 left-0 right-0 shadow-lg border border-gray-200 bg-white max-h-60 overflow-y-auto z-[1000]" style={{ pointerEvents: 'auto' }}>
        <div className="p-2">
          <div
            className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1"
            role="presentation"
          >
            Saran Pencarian
          </div>
          {suggestions.map((result, index) => (
            <button
              key={result.painPoint.id || index}
              type="button"
              data-index={index}
              role="option"
              aria-selected={selectedIndex === index}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors',
                'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none cursor-pointer',
                'relative z-[1001]', // Ensure button is above other elements
                selectedIndex === index && 'bg-primary/10 border border-primary/20',
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked for:', result.painPoint.title);
                handleSelect(result);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              style={{ pointerEvents: 'auto', position: 'relative', userSelect: 'none', zIndex: 10000 }}
            >
              <Wrench className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground block truncate">
                  {result.painPoint.title}
                </span>
                {result.matchedKeywords.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Cocok: {result.matchedKeywords.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>
              {result.confidence > 0.7 && (
                <span className="text-xs text-primary font-medium shrink-0" aria-label={`Tingkat kecocokan ${Math.round(result.confidence * 100)} persen`}>
                  {Math.round(result.confidence * 100)}%
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
