'use client';

import Link from 'next/link';
import { Home, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  variant?: 'default' | 'compact';
}

export function ErrorDisplay({
  title,
  message,
  error,
  onRetry,
  showBackButton = true,
  showHomeButton = false,
  variant = 'default',
}: ErrorDisplayProps) {
  const isFetchError =
    (typeof error === 'string' && (error.includes('fetch') || error.includes('network'))) ||
    (error instanceof Error &&
      (error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('Failed to fetch') ||
        error.name === 'TypeError'));

  const displayTitle = title || (isFetchError ? 'Gagal Memuat Data' : 'Terjadi Kesalahan');
  const displayMessage =
    message ||
    (isFetchError
      ? 'Maaf, terjadi kesalahan saat memuat data dari server. Silakan coba lagi.'
      : 'Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.');

  if (variant === 'compact') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{displayTitle}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{displayMessage}</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          )}
          {showHomeButton && (
            <Button asChild size="sm" variant="outline">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Beranda
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 px-4 py-12">
      <div className="text-center space-y-8 max-w-2xl w-full">
        {/* Error Icon with Animation */}
        <div className="animate-rise">
          <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-destructive/10 animate-float-slow">
            <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 animate-rise">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">{displayTitle}</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">{displayMessage}</p>
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-mono break-all">
                {typeof error === 'string' ? error : error.message}
              </p>
            </div>
          )}
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full bg-destructive animate-dot-bounce"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-rise">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="lg"
              variant="default"
              className="transition-transform hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Coba Lagi
            </Button>
          )}

          {showHomeButton && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="transition-transform hover:scale-105 active:scale-95"
            >
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                Kembali ke Listing
              </Link>
            </Button>
          )}

          {showBackButton && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => window.history.back()}
              className="transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

