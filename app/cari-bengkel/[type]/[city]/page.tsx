'use client';

import { useParams } from 'next/navigation';
import { useWaitingLists } from '@/queryHooks/useWaitingList';
import { CTA } from '@/app/workshop/components/CTA';
import { useEffect, useMemo, useState } from 'react';

export default function TypeCityWorkshopPage() {
  const params = useParams<{ type: string; city: string }>();
  const typeIdOrName = decodeURIComponent(params?.type ?? '');
  const cityIdOrName = decodeURIComponent(params?.city ?? '');
  const { data: allWorkshops, isLoading } = useWaitingLists();
  const [typeName, setTypeName] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);

  // Fetch type and city names
  useEffect(() => {
    if (!typeIdOrName || !cityIdOrName) return;
    
    const fetchNames = async () => {
      try {
        // Fetch type from categories
        const categoriesRes = await fetch('/api/waiting-list/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json().catch(() => ({}));
          const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : Array.isArray(categoriesData) ? categoriesData : [];
          
          for (const category of categories) {
            if (Array.isArray(category.types)) {
              const type = category.types.find((t: { id?: string; name?: string }) => 
                t.id?.trim() === typeIdOrName.trim() || 
                t.name?.toLowerCase().trim() === typeIdOrName.toLowerCase()
              );
              if (type?.name) {
                setTypeName(type.name);
                break;
              }
            }
          }
        }

        // Fetch city name
        const cityRes = await fetch(`/api/sys_city/${encodeURIComponent(cityIdOrName)}`);
        if (cityRes.ok) {
          const cityData = await cityRes.json().catch(() => ({}));
          const city = cityData?.data || cityData;
          if (city?.name) {
            setCityName(city.name);
          }
        }
      } catch (error) {
        console.error('Error fetching names:', error);
      }
    };

    void fetchNames();
  }, [typeIdOrName, cityIdOrName]);

  // Filter workshops by type and city
  const filteredWorkshops = useMemo(() => {
    if (!allWorkshops || !typeIdOrName || !cityIdOrName) return [];
    
    return allWorkshops.filter((workshop) => {
      // Match city
      const cityMatch = workshop.city?.trim() === cityIdOrName.trim();
      
      // Match type
      const workshopTypes = workshop.workshopTypes || [];
      const typeMatch = workshopTypes.some((t: { id?: string; name?: string }) => 
        t.id?.trim() === typeIdOrName.trim() || 
        t.name?.toLowerCase().trim() === typeIdOrName.toLowerCase()
      );
      
      return cityMatch && typeMatch;
    });
  }, [allWorkshops, typeIdOrName, cityIdOrName]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {typeName && cityName 
              ? `Cari Bengkel ${typeName} di ${cityName}`
              : 'Cari Bengkel'}
          </h1>
          <p className="text-muted-foreground">
            {filteredWorkshops.length > 0 
              ? `Ditemukan ${filteredWorkshops.length} bengkel ${typeName || ''} di ${cityName || cityIdOrName}`
              : `Mencari bengkel ${typeName || ''} di ${cityName || cityIdOrName}...`}
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

