import { notFound } from 'next/navigation';
import { getServiceTokenWithRefresh } from '@/lib/utils/service-token-manager';
import {
  getCityData,
  getProvinceData,
  getDistrictData,
  getSubdistrictData,
} from '@/lib/utils/location-data';
import { createSlug } from '@/lib/utils/slug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Building2, MessageCircle, ExternalLink } from 'lucide-react';
import { WorkshopGalleryClient } from './components/WorkshopGalleryClient';
import { WorkshopBackButton } from './components/WorkshopBackButton';
import { WorkshopClaimButton } from './components/WorkshopClaimButton';
import { WorkingHoursDisplay } from './components/WorkingHoursDisplay';
import { WorkshopMap } from '../components/WorkshopMap';
import { ListingDisclaimer } from '../components/ListingDisclaimer';

export const revalidate = 3600;

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

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

async function getWorkshopData(slugOrId: string) {
  try {
    const token = await getServiceTokenWithRefresh();

    const res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(slugOrId)}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });

    if (res.status === 404) {
      const allRes = await fetch(`${apiBase}/waiting-list`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      });

      if (allRes.ok) {
        const allData = await allRes.json().catch(() => ({}));
        const items = Array.isArray(allData) ? allData : (allData?.data || []);
        const foundItem = items.find(
          (item: { slug?: string | null; name?: string; id?: string }) => {
            if (item.slug && item.slug.toLowerCase() === slugOrId.toLowerCase()) return true;
            if (item.id === slugOrId) return true;
            if (item.name) return createSlug(item.name) === slugOrId;
            return false;
          },
        );
        return foundItem || null;
      }
    }

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data?.data || data;
    }

    return null;
  } catch {
    return null;
  }
}

async function getWorkshopImages(waitingListId: string): Promise<WorkshopImage[]> {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/wks/images?waitingListId=${encodeURIComponent(waitingListId)}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch {
    return [];
  }
}

async function getWorkshopVideos(waitingListId: string): Promise<WorkshopVideo[]> {
  try {
    const token = await getServiceTokenWithRefresh();
    const res = await fetch(`${apiBase}/wks/videos?waitingListId=${encodeURIComponent(waitingListId)}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch {
    return [];
  }
}

export default async function WorkshopDetailPage({ params }: { params: { slug: string } }) {
  const slugOrId = params?.slug ?? '';

  const workshop = await getWorkshopData(slugOrId);
  if (!workshop) notFound();

  const waitingListId = workshop.id?.trim();

  // Fetch images, videos, and location names in parallel
  const [images, videos, cityData, provinceData, districtData, subdistrictData] =
    await Promise.all([
      waitingListId ? getWorkshopImages(waitingListId) : Promise.resolve([]),
      waitingListId ? getWorkshopVideos(waitingListId) : Promise.resolve([]),
      workshop.city ? getCityData(workshop.city) : Promise.resolve(null),
      workshop.province ? getProvinceData(workshop.province) : Promise.resolve(null),
      workshop.district ? getDistrictData(workshop.district) : Promise.resolve(null),
      workshop.subdistrict ? getSubdistrictData(workshop.subdistrict) : Promise.resolve(null),
    ]);

  const cityName = cityData?.name || null;
  const provinceName = provinceData?.name || null;
  const districtName = districtData?.name || null;
  const subdistrictName = subdistrictData?.name || null;

  // Build full address
  const addressParts = [
    workshop.address,
    subdistrictName,
    districtName,
    cityName || workshop.city,
    provinceName || workshop.province,
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ');

  // Build Google Maps URL
  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : '';

  // Build WhatsApp URL server-side
  const phone = workshop.mobile || workshop.phone || '';
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  let normalized = digitsOnly;
  if (digitsOnly.startsWith('0')) normalized = `62${digitsOnly.slice(1)}`;
  else if (digitsOnly.startsWith('8')) normalized = `62${digitsOnly}`;
  const isValidWa = /^62[0-9]{8,13}$/.test(normalized);
  const whatsappUrl =
    isValidWa && workshop.claimStatus === 'CLAIMED'
      ? `https://wa.me/${normalized}?text=${encodeURIComponent(`Halo, saya tertarik dengan layanan ${workshop.name}.`)}`
      : '';

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
      <div className="mb-6">
        <WorkshopBackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{workshop.name}</h1>
            {workshop.categoryName && (
              <Badge variant="secondary" className="text-base">
                {workshop.categoryName}
              </Badge>
            )}
          </div>

          {/* Claim Section */}
          {workshop.claimStatus !== 'CLAIMED' && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Kamu bisa menambahkan 3 foto setelah melakukan klaim bahwa kamu adalah pemilik
                  bengkel ini.
                </p>
                <WorkshopClaimButton workshopName={workshop.name} />
              </CardContent>
            </Card>
          )}

          {/* Gallery + Videos (client component) */}
          <WorkshopGalleryClient
            images={images}
            videos={videos}
            workshopName={workshop.name}
          />

          {/* Description */}
          {workshop.description && (
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {workshop.description}
                  </p>
                </div>
              </CardContent>
            </Card>
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
                {workshop.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Telepon</p>
                      {workshop.claimStatus === 'CLAIMED' ? (
                        <a
                          href={`tel:${workshop.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {workshop.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">••• ••• ••••</span>
                      )}
                    </div>
                  </div>
                )}
                {workshop.mobile && (
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Mobile / WhatsApp</p>
                      {workshop.claimStatus === 'CLAIMED' && whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {workshop.mobile}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">••• ••• ••••</span>
                      )}
                    </div>
                  </div>
                )}
                {workshop.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a
                        href={`mailto:${workshop.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {workshop.email}
                      </a>
                    </div>
                  </div>
                )}
                {workshop.categoryName && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Kategori</p>
                      <p className="text-sm text-muted-foreground">{workshop.categoryName}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Button */}
          {whatsappUrl && (
            <Card>
              <CardContent className="pt-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    size="lg"
                    className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Hubungi via WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
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
                {workshop.address && (
                  <p className="text-sm text-foreground leading-relaxed">{workshop.address}</p>
                )}
                <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
                  {subdistrictName && <span>{subdistrictName}</span>}
                  {subdistrictName && (districtName || workshop.district) && <span>•</span>}
                  {districtName && <span>{districtName}</span>}
                  {!districtName && workshop.district && <span>{workshop.district}</span>}
                  {(districtName || workshop.district) && (cityName || workshop.city) && (
                    <span>•</span>
                  )}
                  {cityName && <span>{cityName}</span>}
                  {!cityName && workshop.city && <span>{workshop.city}</span>}
                  {(cityName || workshop.city) && (provinceName || workshop.province) && (
                    <span>•</span>
                  )}
                  {provinceName && <span>{provinceName}</span>}
                  {!provinceName && workshop.province && <span>{workshop.province}</span>}
                </div>
              </div>

              {mapsUrl && (
                <Button asChild variant="outline" className="w-full">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat di Google Maps
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Jam Operasional (client component — fetches own data) */}
          {waitingListId && <WorkingHoursDisplay waitingListId={waitingListId} />}

          {/* Map Embed */}
          <Card>
            <CardContent className="p-0">
              <WorkshopMap
                latitude={workshop.latitude}
                longitude={workshop.longitude}
                address={workshop.address}
                name={workshop.name}
                fallbackAddress={fullAddress}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ListingDisclaimer />
    </main>
  );
}
