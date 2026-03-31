'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X, Play, Video } from 'lucide-react';

interface WorkshopImage {
  id: string;
  imageURL: string;
  isPrimary?: boolean;
  seq?: number | null;
  createdAt?: string;
}

interface WorkshopVideo {
  id: string;
  videoURL: string;
  thumbnailURL?: string;
  title?: string;
  duration?: number;
  isPrimary?: boolean;
  seq?: number | null;
}

interface WorkshopGalleryClientProps {
  images: WorkshopImage[];
  videos: WorkshopVideo[];
  workshopName: string;
}

export function WorkshopGalleryClient({
  images,
  videos,
  workshopName,
}: WorkshopGalleryClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const galleryImages =
    images.length > 0
      ? [...images]
          .sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            if (a.seq !== null && a.seq !== undefined && b.seq !== null && b.seq !== undefined)
              return a.seq - b.seq;
            if (a.seq !== null && a.seq !== undefined) return -1;
            if (b.seq !== null && b.seq !== undefined) return 1;
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          })
          .map((img) => img.imageURL)
      : ['/images/workshop-placeholder-3.webp'];

  const sortedVideos = [...videos].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    if (a.seq !== null && a.seq !== undefined && b.seq !== null && b.seq !== undefined)
      return a.seq - b.seq;
    return 0;
  });

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, galleryImages.length]);

  return (
    <>
      {/* Gallery Carousel */}
      <Card className="overflow-hidden">
        <div className="relative h-64 md:h-80 w-full bg-gray-100">
          <div className="relative h-full w-full">
            <Image
              src={galleryImages[currentImageIndex] || galleryImages[0]}
              alt={`${workshopName} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover cursor-pointer"
              priority
              onClick={() => setIsLightboxOpen(true)}
              unoptimized
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(
                      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {galleryImages.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-white scale-110'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>

          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            <Image
              src={galleryImages[currentImageIndex] || galleryImages[0]}
              alt={`${workshopName} - Image ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              unoptimized={galleryImages[currentImageIndex]?.startsWith('http')}
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(
                      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
                    );
                  }}
                  className="absolute left-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
                  }}
                  className="absolute right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {sortedVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Video Bengkel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedVideos.map((video) => (
                <div
                  key={video.id}
                  className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                  onClick={() => window.open(video.videoURL, '_blank')}
                >
                  {video.thumbnailURL ? (
                    <Image
                      src={video.thumbnailURL}
                      alt={video.title || `Video ${video.id}`}
                      fill
                      className="object-cover"
                      unoptimized={video.thumbnailURL.startsWith('http')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Video className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className="bg-white/90 rounded-full p-4">
                      <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(video.duration / 60)}:
                      {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                    </div>
                  )}
                  {video.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Utama
                    </div>
                  )}
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white text-sm font-medium">{video.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
