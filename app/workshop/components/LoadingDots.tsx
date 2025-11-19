'use client';

import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  className?: string;
  text?: string;
}

export function LoadingDots({ className, text = 'Memuat' }: LoadingDotsProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full bg-primary animate-dot-bounce"
          style={{
            animationDelay: '0ms',
          }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-primary animate-dot-bounce"
          style={{
            animationDelay: '200ms',
          }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-primary animate-dot-bounce"
          style={{
            animationDelay: '400ms',
          }}
        />
      </div>
      <span className="text-base font-medium text-muted-foreground">
        {text}
      </span>
    </div>
  );
}

