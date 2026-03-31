import { getCityData, getWorkshopsByLocation } from '@/lib/utils/location-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { CTA } from '@/app/workshop/components/CTA';

export const revalidate = 3600;

interface Workshop {
  id: string;
  name: string;
  slug?: string | null;
  address?: string | null;
  categoryName?: string | null;
  workshopTypes?: Array<{ id: string; name: string | null }>;
}

export default async function CityWorkshopPage({ params }: { params: { city: string } }) {
  const cityIdOrName = decodeURIComponent(params?.city ?? '');

  // Fetch city data server-side
  const city = await getCityData(cityIdOrName).catch(() => null);
  const cityName = city?.name || cityIdOrName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  // Fetch a representative set of workshops for this city (for SSR content)
  const allWorkshops: Workshop[] = city?.id
    ? await getWorkshopsByLocation({ city: city.id }).catch(() => [])
    : [];
  const workshopCount = allWorkshops.length;
  const featuredWorkshops = allWorkshops.slice(0, 6);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* SSR header — visible immediately to crawlers */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {workshopCount > 0
              ? `Daftar Bengkel di ${cityName} — ${workshopCount} Bengkel Tersedia`
              : `Daftar Bengkel di ${cityName}`}
          </h1>
          <p className="text-muted-foreground">
            {workshopCount > 0
              ? `Ditemukan ${workshopCount} bengkel di ${cityName}. Temukan bengkel terdekat, lihat promo, dan hubungi langsung.`
              : `Mencari bengkel terpercaya di ${cityName}? Temukan pilihan bengkel servis mobil dan motor terbaik.`}
          </p>
        </div>

        {/* Static workshop cards — rendered server-side for SEO */}
        {featuredWorkshops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {featuredWorkshops.map((workshop) => (
              <Link
                key={workshop.id}
                href={`/workshop/${workshop.slug || workshop.id}`}
                className="block"
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h2 className="font-semibold truncate">{workshop.name}</h2>
                        {workshop.categoryName && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {workshop.categoryName}
                          </Badge>
                        )}
                        {workshop.address && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {workshop.address}
                          </p>
                        )}
                        {workshop.workshopTypes && workshop.workshopTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {workshop.workshopTypes.slice(0, 3).map((type) => (
                              <Badge key={type.id} variant="outline" className="text-xs">
                                {type.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Interactive CTA — full search, filter, pagination */}
        <Suspense fallback={<div className="text-muted-foreground py-8 text-center">Memuat...</div>}>
          <CTA variant="section" />
        </Suspense>
      </div>
    </main>
  );
}
