'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PainPointBadgeProps = {
  title: string;
  confidence?: number;
  matchedKeywords?: string[];
  onDismiss?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
};

export function PainPointBadge({
  title,
  confidence,
  matchedKeywords = [],
  onDismiss,
  className,
  variant = 'default',
}: PainPointBadgeProps) {
  if (variant === 'compact') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-foreground bg-primary/10 border-primary/30',
          className,
        )}
      >
        <Sparkles className="h-3 w-3 text-primary" />
        <span>{title}</span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg',
        className,
      )}
    >
      <Sparkles className="h-4 w-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Menampilkan bengkel untuk:{' '}
          <span className="font-semibold text-primary">{title}</span>
        </p>
        {matchedKeywords.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Ditemukan berdasarkan: {matchedKeywords.slice(0, 3).join(', ')}
            {matchedKeywords.length > 3 && '...'}
          </p>
        )}
        {confidence !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Tingkat kecocokan: {Math.round(confidence * 100)}%
          </p>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
