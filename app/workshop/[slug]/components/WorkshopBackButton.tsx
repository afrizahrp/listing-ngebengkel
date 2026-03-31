'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function WorkshopBackButton() {
  const router = useRouter();
  return (
    <Button variant="outline" size="sm" onClick={() => router.back()}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Kembali
    </Button>
  );
}
