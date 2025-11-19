'use client';

import { useMemo } from 'react';

interface WorkshopMapProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  address?: string;
  name?: string;
  fallbackAddress?: string; // Alamat lengkap untuk Google Maps
}

export function WorkshopMap({ 
  latitude, 
  longitude, 
  address, 
  name,
  fallbackAddress 
}: WorkshopMapProps) {
  // Parse lat/lng dari string atau number
  const lat = latitude ? (typeof latitude === 'string' ? parseFloat(latitude) : latitude) : null;
  const lng = longitude ? (typeof longitude === 'string' ? parseFloat(longitude) : longitude) : null;

  // Generate Google Maps Embed URL (tidak perlu API key)
  // Format: https://www.google.com/maps/embed?pb=... atau menggunakan query parameter sederhana
  const mapEmbedUrl = useMemo(() => {
    // Jika ada koordinat, gunakan koordinat
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      // Format: https://www.google.com/maps?q=lat,lng
      // Untuk embed, kita bisa menggunakan format yang lebih sederhana
      return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
    }

    // Jika tidak ada koordinat, gunakan alamat
    if (fallbackAddress && fallbackAddress.trim().length > 0) {
      return `https://www.google.com/maps?q=${encodeURIComponent(fallbackAddress)}&output=embed`;
    }

    // Fallback ke alamat utama jika ada
    if (address && address.trim().length > 0) {
      return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    }

    // Default: Jakarta
    return 'https://www.google.com/maps?q=-6.2088,106.8456&output=embed';
  }, [lat, lng, fallbackAddress, address]);

  // Generate link Google Maps untuk dibuka di tab baru
  const mapsLinkUrl = useMemo(() => {
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    if (fallbackAddress && fallbackAddress.trim().length > 0) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`;
    }
    if (address && address.trim().length > 0) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    return 'https://www.google.com/maps';
  }, [lat, lng, fallbackAddress, address]);

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden border">
      <iframe
        src={mapEmbedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={name || 'Lokasi Bengkel'}
      />
      {/* Overlay untuk link ke Google Maps */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <a
          href={mapsLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-sm font-medium hover:underline flex items-center gap-1"
        >
          Buka di Google Maps
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

