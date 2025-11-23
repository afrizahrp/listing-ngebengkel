'use client';

import { useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  const isFetchError =
    error.message?.includes('fetch') ||
    error.message?.includes('network') ||
    error.message?.includes('Failed to fetch') ||
    error.name === 'TypeError';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 px-4">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Error Icon with Animation */}
        <div className="animate-rise">
          <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-destructive/10 animate-float-slow">
            <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 animate-rise">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {isFetchError ? 'Gagal Memuat Data' : 'Terjadi Kesalahan'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {isFetchError
              ? 'Maaf, terjadi kesalahan saat memuat data dari server. Silakan coba lagi.'
              : 'Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.'}
          </p>
          {error.message && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-mono break-all">
                {error.message}
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
          <Button
            onClick={reset}
            size="lg"
            variant="default"
            className="transition-transform hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Coba Lagi
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => window.history.back()}
            className="transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}

