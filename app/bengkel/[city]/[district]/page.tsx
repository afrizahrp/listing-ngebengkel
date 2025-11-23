'use client';

import { useParams } from 'next/navigation';
import { useWaitingLists } from '@/queryHooks/useWaitingList';
import { CTA } from '@/app/workshop/components/CTA';
import { useEffect, useMemo, useState } from 'react';

export default function DistrictWorkshopPage() {
  const params = useParams<{ city: string; district: string }>();
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  const districtIdOrName = decodeURIComponent(params?.district ?? '');
  const { data: allWorkshops, isLoading } = useWaitingLists();
  const [cityName, setCityName] = useState<string | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);

  // Fetch location names
  useEffect(() => {
    const fetchLocationNames = async () => {
      try {
        const [cityRes, districtRes] = await Promise.all([
          fetch(`/api/sys_city/${encodeURIComponent(cityIdOrName)}`),
          fetch(`/api/sys_district/${encodeURIComponent(districtIdOrName)}`),
        ]);

        if (cityRes.ok) {
          const cityData = await cityRes.json().catch(() => ({}));
          const city = cityData?.data || cityData;
          if (city?.name) setCityName(city.name);
        }

        if (districtRes.ok) {
          const districtData = await districtRes.json().catch(() => ({}));
          const district = districtData?.data || districtData;
          if (district?.name) setDistrictName(district.name);
        }
      } catch (error) {
        console.error('Error fetching location names:', error);
      }
    };

    if (cityIdOrName && districtIdOrName) {
      void fetchLocationNames();
    }
  }, [cityIdOrName, districtIdOrName]);

  // Filter workshops by city and district
  const filteredWorkshops = useMemo(() => {
    if (!allWorkshops || !cityIdOrName || !districtIdOrName) return [];
    
    return allWorkshops.filter((workshop) => {
      return (
        workshop.city?.trim() === cityIdOrName.trim() &&
        workshop.district?.trim() === districtIdOrName.trim()
      );
    });
  }, [allWorkshops, cityIdOrName, districtIdOrName]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {districtName && cityName 
              ? `Daftar Bengkel di ${districtName}, ${cityName}`
              : 'Daftar Bengkel'}
          </h1>
          <p className="text-muted-foreground">
            {filteredWorkshops.length > 0 
              ? `Ditemukan ${filteredWorkshops.length} bengkel di ${districtName || districtIdOrName}, ${cityName || cityIdOrName}`
              : `Mencari bengkel di ${districtName || districtIdOrName}, ${cityName || cityIdOrName}...`}
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

