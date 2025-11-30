import { NextRequest, NextResponse } from 'next/server';
import { getApiHeaders } from '@/lib/utils/get-api-headers';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } },
) {
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000';

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  
  // Handle both Promise and direct params (Next.js 15+ uses Promise)
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = resolvedParams?.slug ?? '';
  
  if (!slug) {
    return NextResponse.json(
      { message: 'Pain point slug is required' },
      { status: 400 },
    );
  }
  
  // Skip jika slug adalah "search" - ini harus di-handle oleh route /search
  // Next.js seharusnya memprioritaskan route literal, tapi untuk memastikan,
  // kita handle search secara langsung di sini untuk menghindari konflik routing
  if (slug === 'search') {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { message: 'Query parameter "q" is required' },
        { status: 400 },
      );
    }
    
    // Forward ke backend search endpoint
    const target = `${apiBase}/pain-points/search?q=${encodeURIComponent(query)}`;
    const headers = await getApiHeaders(request);
    
    let res = await fetch(target, {
      headers,
      cache: 'no-store',
    });
    
    // If unauthorized dan pakai service token, coba refresh sekali
    if (res.status === 401 && headers['Authorization']) {
      if (typeof global !== 'undefined') {
        (global as any).cachedServiceToken = null;
      }
      const newHeaders = await getApiHeaders(request);
      res = await fetch(target, {
        headers: newHeaders,
        cache: 'no-store',
      });
    }
    
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  
  // Backend menggunakan slug untuk mencari pain point
  const target = `${apiBase}/pain-points/${encodeURIComponent(slug)}`;

  // Get headers dengan priority: anonymous_id > service token
  const headers = await getApiHeaders(request);

  let res = await fetch(target, {
    headers,
    cache: 'no-store',
  });

  // If unauthorized dan pakai service token, coba refresh sekali
  if (res.status === 401 && headers['Authorization']) {
    // Clear cache dan coba lagi dengan service token baru
    if (typeof global !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).cachedServiceToken = null;
    }
    const newHeaders = await getApiHeaders(request);
    res = await fetch(target, {
      headers: newHeaders,
      cache: 'no-store',
    });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

