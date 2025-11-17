'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamic import untuk menghindari SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);


// Fix untuk default marker icon di Next.js
const createIcon = (iconUrl: string, shadowUrl: string) => {
  return L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Default marker icon
const defaultIcon = createIcon(
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
);

interface WorkshopMapProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  address?: string;
  name?: string;
  fallbackAddress?: string; // Alamat lengkap untuk geocoding fallback
}

export function WorkshopMap({ 
  latitude, 
  longitude, 
  address, 
  name,
  fallbackAddress 
}: WorkshopMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Parse lat/lng dari string atau number
  const lat = latitude ? (typeof latitude === 'string' ? parseFloat(latitude) : latitude) : null;
  const lng = longitude ? (typeof longitude === 'string' ? parseFloat(longitude) : longitude) : null;

  // Geocoding menggunakan Nominatim API (gratis, bagian dari OpenStreetMap)
  useEffect(() => {
    // Jika sudah ada koordinat, tidak perlu geocode
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      setGeocodedCoords(null);
      return;
    }

    // Jika tidak ada alamat untuk geocode, skip
    if (!fallbackAddress || fallbackAddress.trim().length === 0) {
      return;
    }

    // Geocode alamat ke koordinat
    const geocodeAddress = async () => {
      setIsGeocoding(true);
      try {
        // Nominatim API - gratis, rate limit: 1 request per detik
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&limit=1`,
          {
            headers: {
              'User-Agent': 'Ngebengkel Workshop Map' // Required by Nominatim
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const result = data[0];
            const geocodedLat = parseFloat(result.lat);
            const geocodedLng = parseFloat(result.lon);
            
            if (!isNaN(geocodedLat) && !isNaN(geocodedLng)) {
              setGeocodedCoords({ lat: geocodedLat, lng: geocodedLng });
            }
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsGeocoding(false);
      }
    };

    // Delay untuk menghindari rate limit
    const timeoutId = setTimeout(() => {
      void geocodeAddress();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [lat, lng, fallbackAddress]);

  // Gunakan koordinat dari props atau hasil geocoding
  const finalLat = lat !== null && !isNaN(lat) ? lat : geocodedCoords?.lat ?? null;
  const finalLng = lng !== null && !isNaN(lng) ? lng : geocodedCoords?.lng ?? null;

  const centerLat = finalLat ?? -6.2088; // Default: Jakarta
  const centerLng = finalLng ?? 106.8456; // Default: Jakarta
  const hasValidCoordinates = finalLat !== null && finalLng !== null && !isNaN(finalLat) && !isNaN(finalLng);

  // Loading state saat geocoding
  if (isGeocoding) {
    return (
      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">
            Mencari lokasi...
          </p>
        </div>
      </div>
    );
  }

  // Jika tidak ada koordinat valid setelah geocoding
  if (!hasValidCoordinates) {
    return (
      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Lokasi tidak ditemukan
          </p>
          {fallbackAddress && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Cari lokasi di Google Maps
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        ref={mapRef}
        key={`${finalLat}-${finalLng}`} // Force re-render saat koordinat berubah
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[finalLat!, finalLng!]} icon={defaultIcon}>
          {name && (
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{name}</p>
                {address && <p className="text-muted-foreground mt-1">{address}</p>}
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}

