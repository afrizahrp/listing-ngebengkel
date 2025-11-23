'use client';

import { useParams } from 'next/navigation';
import { useWaitingLists } from '@/queryHooks/useWaitingList';
import { CTA } from '@/app/workshop/components/CTA';
import { useEffect, useMemo, useState } from 'react';

export default function CityWorkshopPage() {
  const params = useParams<{ city: string }>();
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  const { data: allWorkshops, isLoading } = useWaitingLists();
  const [cityName, setCityName] = useState<string | null>(null);

  // Fetch city name
  useEffect(() => {
    if (!cityIdOrName) return;
    
    const fetchCityName = async () => {
      try {
        const res = await fetch(`/api/sys_city/${encodeURIComponent(cityIdOrName)}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const city = data?.data || data;
          if (city?.name) {
            setCityName(city.name);
          }
        }
      } catch (error) {
        console.error('Error fetching city name:', error);
      }
    };

    void fetchCityName();
  }, [cityIdOrName]);

  // Filter workshops by city
  const filteredWorkshops = useMemo(() => {
    if (!allWorkshops || !cityIdOrName) return [];
    
    return allWorkshops.filter((workshop) => {
      // Match by ID or try to match by name (slug)
      return workshop.city?.trim() === cityIdOrName.trim();
    });
  }, [allWorkshops, cityIdOrName]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {cityName ? `Daftar Bengkel di ${cityName}` : 'Daftar Bengkel'}
          </h1>
          <p className="text-muted-foreground">
            {filteredWorkshops.length > 0 
              ? `Ditemukan ${filteredWorkshops.length} bengkel di ${cityName || cityIdOrName}`
              : `Mencari bengkel di ${cityName || cityIdOrName}...`}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Memuat daftar bengkel...</p>
          </div>
        ) : (
          <CTA variant="section" />
        )}
      </div>
    </main>
  );
}

