'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRef, useEffect } from 'react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  suggestionsOpen?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
};

export function SearchBar({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  suggestionsOpen = false,
  ariaLabel = 'Cari nama bengkel atau masalah kendaraan',
  ariaDescribedBy,
  placeholder = 'Cari nama bengkel atau masalah kendaraan (contoh: AC tidak dingin, rem blong)',
  inputRef: externalInputRef,
}: SearchBarProps) {
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if focus is moving to suggestions
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('#search-suggestions')) {
      // Don't blur if clicking on suggestions
      return;
    }
    // Delay blur untuk allow click pada suggestions
    // Use longer delay to ensure click events complete
    setTimeout(() => {
      // Double-check that we're not clicking on suggestions
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.closest('#search-suggestions')) {
        return;
      }
      // Check if mouse is over suggestions
      const windowWithMouse = window as typeof window & {
        lastMouseX?: number;
        lastMouseY?: number;
      };
      const mouseTarget = document.elementFromPoint(
        windowWithMouse.lastMouseX || 0,
        windowWithMouse.lastMouseY || 0
      );
      if (mouseTarget && mouseTarget.closest('#search-suggestions')) {
        return;
      }
      onBlur?.();
    }, 200);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Pass keyboard events ke parent untuk handle navigation
    onKeyDown?.(event);
  };

  // Auto-focus saat suggestions open (optional)
  useEffect(() => {
    if (suggestionsOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [suggestionsOpen, inputRef]);

  return (
    <div className="relative" role="search">
      <Search
        className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="pl-9"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={suggestionsOpen}
        aria-autocomplete="list"
        aria-controls={suggestionsOpen ? 'search-suggestions' : undefined}
        autoComplete="off"
        role="combobox"
      />
    </div>
  );
}

