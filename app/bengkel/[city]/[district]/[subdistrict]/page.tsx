'use client';

import { useParams } from 'next/navigation';
import { useWaitingLists } from '@/queryHooks/useWaitingList';
import { CTA } from '@/app/workshop/components/CTA';
import { useEffect, useMemo, useState } from 'react';

export default function SubdistrictWorkshopPage() {
  const params = useParams<{ city: string; district: string; subdistrict: string }>();
  const cityIdOrName = decodeURIComponent(params?.city ?? '').trim();
  const districtIdOrName = decodeURIComponent(params?.district ?? '').trim();
  const subdistrictIdOrName = decodeURIComponent(params?.subdistrict ?? '').trim();
  const { data: allWorkshops, isLoading } = useWaitingLists();
  const [cityName, setCityName] = useState<string | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [subdistrictName, setSubdistrictName] = useState<string | null>(null);

  // Fetch location names
  useEffect(() => {
    const fetchLocationNames = async () => {
      try {
        const [cityRes, districtRes, subdistrictRes] = await Promise.all([
          fetch(`/api/sys_city/${encodeURIComponent(cityIdOrName)}`),
          fetch(`/api/sys_district/${encodeURIComponent(districtIdOrName)}`),
          fetch(`/api/sys_subdistrict/${encodeURIComponent(subdistrictIdOrName)}`),
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

        if (subdistrictRes.ok) {
          const subdistrictData = await subdistrictRes.json().catch(() => ({}));
          const subdistrict = subdistrictData?.data || subdistrictData;
          if (subdistrict?.name) setSubdistrictName(subdistrict.name);
        }
      } catch (error) {
        console.error('Error fetching location names:', error);
      }
    };

    if (cityIdOrName && districtIdOrName && subdistrictIdOrName) {
      void fetchLocationNames();
    }
  }, [cityIdOrName, districtIdOrName, subdistrictIdOrName]);

  // Filter workshops by city, district, and subdistrict
  const filteredWorkshops = useMemo(() => {
    if (!allWorkshops || !cityIdOrName || !districtIdOrName || !subdistrictIdOrName) return [];
    
    return allWorkshops.filter((workshop) => {
      return (
        workshop.city?.trim() === cityIdOrName.trim() &&
        workshop.district?.trim() === districtIdOrName.trim() &&
        workshop.subdistrict?.trim() === subdistrictIdOrName.trim()
      );
    });
  }, [allWorkshops, cityIdOrName, districtIdOrName, subdistrictIdOrName]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {subdistrictName && districtName && cityName
              ? `Daftar Bengkel di ${subdistrictName}, ${districtName}, ${cityName}`
              : 'Daftar Bengkel'}
          </h1>
          <p className="text-muted-foreground">
            {filteredWorkshops.length > 0 
              ? `Ditemukan ${filteredWorkshops.length} bengkel di ${subdistrictName || subdistrictIdOrName}, ${districtName || districtIdOrName}, ${cityName || cityIdOrName}`
              : `Mencari bengkel di ${subdistrictName || subdistrictIdOrName}, ${districtName || districtIdOrName}, ${cityName || cityIdOrName}...`}
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

