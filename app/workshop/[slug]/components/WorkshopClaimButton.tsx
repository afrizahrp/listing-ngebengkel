'use client';

import { Button } from '@/components/ui/button';
import { CameraIcon } from 'lucide-react';
import { CLAIM_MANUAL_WHATSAPP_NUMBER } from '@/lib/constants';

interface WorkshopClaimButtonProps {
  workshopName: string;
}

export function WorkshopClaimButton({ workshopName }: WorkshopClaimButtonProps) {
  const handleClick = () => {
    const digitsOnly = CLAIM_MANUAL_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
    let normalized = digitsOnly;
    if (digitsOnly.startsWith('0')) {
      normalized = `62${digitsOnly.slice(1)}`;
    } else if (digitsOnly.startsWith('8')) {
      normalized = `62${digitsOnly}`;
    }
    const message = `Halo, saya ingin menambahkan foto pada listing ${workshopName} dan mengaktifkan WhatsApp agar pelanggan bisa menghubungi langsung.`;
    window.open(`https://wa.me/${normalized}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
      onClick={handleClick}
    >
      <CameraIcon className="h-5 w-5" />
      <span className="font-medium">Tambahkan Foto Bengkel</span>
    </Button>
  );
}
