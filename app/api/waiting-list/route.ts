import { NextResponse } from 'next/server';
import { getApiHeaders } from '@/lib/utils/get-api-headers';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000';

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  
  // Extract query parameters from request URL
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  
  // Build query string for pagination
  const queryParams = new URLSearchParams();
  if (page) queryParams.set('page', page);
  if (limit) queryParams.set('limit', limit);
  
  const queryString = queryParams.toString();
  const target = `${apiBase}/waiting-list${queryString ? `?${queryString}` : ''}`;

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


