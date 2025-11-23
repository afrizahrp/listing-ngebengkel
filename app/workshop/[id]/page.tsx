'use client';

import { useParams, useRouter } from 'next/navigation';
import { useWaitingList } from '@/queryHooks/useWaitingList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { MapPin, Phone, Mail, Building2, MessageCircle, ExternalLink, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { WorkshopMap } from '../components/WorkshopMap';

export default function WorkshopDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const slugOrId = params?.id ?? '';

  // Slug bisa berupa ID atau nama yang sudah di-slug
  // useWaitingList akan handle pencarian berdasarkan slug
  const { data, isLoading, isError } = useWaitingList(slugOrId, { enabled: Boolean(slugOrId) });
  
  // State untuk menyimpan nama wilayah
  const [provinceName, setProvinceName] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [subdistrictName, setSubdistrictName] = useState<string | null>(null);

  // Generate gallery images (semua gambar dari 1-7 sebagai sample)
  const galleryImages = useMemo(() => {
    // Untuk demo, gunakan semua gambar dari 1-7
    // Di production, ini bisa dari data.facebookImages atau data.gallery
    return Array.from({ length: 7 }, (_, i) => `/images/${i + 1}.png`);
  }, []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Keyboard navigation untuk lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') return;

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

  // Helper function untuk fetch dengan retry (handle rate limit 429)
  const fetchWithRetry = async (url: string, retries = 3, delay = 500): Promise<{ name?: string; data?: { name?: string } } | null> => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        
        if (res.status === 429) {
          // Rate limit - tunggu dan retry
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            continue;
          }
          return null;
        }
        
        if (res.ok) {
          return await res.json().catch(() => null);
        }
        
        if (res.status === 404) {
          // Endpoint tidak ada
          return null;
        }
        
        return null;
      } catch {
        if (i === retries - 1) return null;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
    return null;
  };

  // Fetch nama wilayah (sequential dengan delay untuk avoid rate limit)
  useEffect(() => {
    if (!data) return;

    const fetchLocationNames = async () => {
      // Fetch secara sequential dengan delay lebih besar untuk menghindari rate limit
      
      // Fetch Province Name
      if (data.province) {
        const provinceData = await fetchWithRetry(`/api/sys_province/${encodeURIComponent(data.province.trim())}`, 3, 1000);
        if (provinceData) {
          const name = provinceData?.name || provinceData?.data?.name;
          if (name && name.trim() && name !== data.province) {
            setProvinceName(name.trim());
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay antar request
      }

      // Fetch City Name (bisa pakai batch jika ada, tapi untuk 1 item lebih simple pakai individual)
      if (data.city) {
        const cityData = await fetchWithRetry(`/api/sys_city/${encodeURIComponent(data.city.trim())}`, 3, 1000);
        if (cityData) {
          const name = cityData?.name || cityData?.data?.name;
          if (name && name.trim() && name !== data.city) {
            setCityName(name.trim());
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Fetch District Name
      if (data.district) {
        const districtData = await fetchWithRetry(`/api/sys_district/${encodeURIComponent(data.district.trim())}`, 3, 1000);
        if (districtData) {
          const name = districtData?.name || districtData?.data?.name;
          if (name && name.trim() && name !== data.district) {
            setDistrictName(name.trim());
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Fetch Subdistrict Name (jika ada field subdistrict dan endpoint tersedia)
      if (data.subdistrict) {
        const subdistrictData = await fetchWithRetry(`/api/sys_subdistrict/${encodeURIComponent(data.subdistrict.trim())}`, 2, 1000);
        if (subdistrictData) {
          const name = subdistrictData?.name || subdistrictData?.data?.name;
          if (name && name.trim() && name !== data.subdistrict) {
            setSubdistrictName(name.trim());
          }
        }
      }
    };

    void fetchLocationNames();
  }, [data]);

  // Generate Google Maps search URL (gratis, tidak perlu API key)
  // Lebih reliable untuk pencarian alamat di Indonesia dibanding OpenStreetMap search
  // Hanya gunakan nama yang sudah di-fetch, jangan gunakan ID
  const mapsUrl = useMemo(() => {
    if (!data) return '';
    const addressParts = [
      data.address,
      subdistrictName, // Hanya gunakan jika sudah di-fetch (bukan ID)
      districtName,    // Hanya gunakan jika sudah di-fetch (bukan ID)
      cityName,        // Hanya gunakan jika sudah di-fetch (bukan ID)
      provinceName     // Hanya gunakan jika sudah di-fetch (bukan ID)
    ].filter(Boolean); // Filter null/undefined/empty
    
    // Pastikan minimal ada alamat utama
    if (addressParts.length === 0) return '';
    
    const address = addressParts.join(', ');
    // Google Maps search URL - gratis, tidak perlu API key
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }, [data, provinceName, cityName, districtName, subdistrictName]);

  // Generate full address untuk map (hanya gunakan nama, bukan ID)
  const fullAddress = useMemo(() => {
    if (!data) return '';
    const addressParts = [
      data.address,
      subdistrictName, // Hanya gunakan jika sudah di-fetch
      districtName,    // Hanya gunakan jika sudah di-fetch
      cityName,        // Hanya gunakan jika sudah di-fetch
      provinceName     // Hanya gunakan jika sudah di-fetch
    ].filter(Boolean); // Filter null/undefined/empty
    
    return addressParts.join(', ');
  }, [data, provinceName, cityName, districtName, subdistrictName]);

  // Generate WhatsApp URL
  const whatsappUrl = useMemo(() => {
    if (!data) return '';
    const phone = data.mobile || data.phone || '';
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    let normalized = digitsOnly;
    if (digitsOnly.startsWith('0')) {
      normalized = `62${digitsOnly.slice(1)}`;
    } else if (digitsOnly.startsWith('8')) {
      normalized = `62${digitsOnly}`;
    }
    const isValidWa = /^62[0-9]{8,13}$/.test(normalized);
    if (!isValidWa) return '';
    const message = `Halo, saya tertarik dengan layanan ${data.name}.`;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  }, [data]);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-muted-foreground">Memuat detail bengkel...</p>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-sm text-destructive">
            {isError ? 'Gagal memuat detail bengkel.' : 'Data bengkel tidak ditemukan.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header dengan Nama */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{data.name}</h1>
            {data.categoryName && (
              <Badge variant="secondary" className="text-base">
                {data.categoryName}
              </Badge>
            )}
          </div>

          {/* Gallery Carousel */}
          <Card className="overflow-hidden">
            <div className="relative h-64 md:h-80 w-full bg-gray-100">
              {/* Main Image */}
              <div className="relative h-full w-full">
                <Image
                  src={galleryImages[currentImageIndex]}
                  alt={`${data.name} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover cursor-pointer"
                  priority
                  onClick={() => setIsLightboxOpen(true)}
                />
                
                {/* Navigation Buttons */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {galleryImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToImage(idx)}
                        className={`
                          relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all
                          ${currentImageIndex === idx 
                            ? 'border-white scale-110' 
                            : 'border-transparent opacity-70 hover:opacity-100'
                          }
                        `}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {data.description && (
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {data.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
                  src={galleryImages[currentImageIndex]}
                  alt={`${data.name} - Image ${currentImageIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
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

          {/* Informasi Kontak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Telepon</p>
                      <a href={`tel:${data.phone}`} className="text-sm text-primary hover:underline">
                        {data.phone}
                      </a>
                    </div>
                  </div>
                )}
                {data.mobile && (
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Mobile / WhatsApp</p>
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {data.mobile}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">{data.mobile}</span>
                      )}
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a href={`mailto:${data.email}`} className="text-sm text-primary hover:underline">
                        {data.email}
                      </a>
                    </div>
                  </div>
                )}
                {data.categoryName && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Kategori</p>
                      <p className="text-sm text-muted-foreground">{data.categoryName}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {whatsappUrl && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Hubungi via WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Lokasi & Map */}
        <div className="space-y-6">
          {/* Lokasi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {data.address && (
                  <p className="text-sm text-foreground leading-relaxed">{data.address}</p>
                )}
                <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
                  {subdistrictName && <span>{subdistrictName}</span>}
                  {subdistrictName && (districtName || data.district) && <span>•</span>}
                  {districtName && <span>{districtName}</span>}
                  {!districtName && data.district && <span>{data.district}</span>}
                  {(districtName || data.district) && (cityName || data.city) && <span>•</span>}
                  {cityName && <span>{cityName}</span>}
                  {!cityName && data.city && <span>{data.city}</span>}
                  {(cityName || data.city) && (provinceName || data.province) && <span>•</span>}
                  {provinceName && <span>{provinceName}</span>}
                  {!provinceName && data.province && <span>{data.province}</span>}
                </div>
              </div>

              {mapsUrl && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat di Google Maps
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Map Embed */}
          <Card>
            <CardContent className="p-0">
              <WorkshopMap
                latitude={data.latitude}
                longitude={data.longitude}
                address={data.address}
                name={data.name}
                fallbackAddress={fullAddress}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}


