'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="text-center space-y-8 max-w-2xl">
        {/* 404 Number with Animation */}
        <div className="animate-rise">
          <h1 className="text-9xl md:text-[12rem] font-bold text-primary animate-float-slow">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="space-y-4 animate-rise">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full bg-primary animate-dot-bounce"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-rise">
          <Button
            variant="outline"
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

