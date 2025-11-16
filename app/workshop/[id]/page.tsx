'use client';

import { useParams, useRouter } from 'next/navigation';
import { useWaitingList } from '@/queryHooks/useWaitingList';
import { Button } from '@/components/ui/button';

export default function WorkshopDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';

  const { data, isLoading, isError } = useWaitingList(id, { enabled: Boolean(id) });

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-0">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          ← Kembali
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat detail bengkel...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Gagal memuat detail bengkel.</p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Data bengkel tidak ditemukan.</p>
      ) : (
        <section className="space-y-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">{data.name}</h1>
            <p className="text-sm text-muted-foreground">
              {data.address}
              {data.district ? ` • ${data.district}` : ''}
              {data.city ? ` • ${data.city}` : ''}
              {data.province ? ` • ${data.province}` : ''}
            </p>
          </header>

          <div className="rounded-xl border border-[#045693]/40 bg-white p-5 shadow-sm">
            <div className="grid gap-2 text-sm">
              {data.phone && <div>Telepon: {data.phone}</div>}
              {data.mobile && <div>Mobile: {data.mobile}</div>}
              {data.email && <div>Email: {data.email}</div>}
              {data.categoryName && <div>Kategori: {data.categoryName}</div>}
            </div>
          </div>

          <div className="rounded-xl border border-[#045693]/40 bg-primary/5 p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Slot servis real-time belum terintegrasi untuk halaman ini.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}


