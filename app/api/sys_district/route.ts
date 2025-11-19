import { NextResponse } from 'next/server';
import { getApiHeaders } from '@/lib/utils/get-api-headers';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

  const url = new URL(request.url);
  const cityId = url.searchParams.get('city_id');

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  const target = cityId
    ? `${apiBase}/sys_district?city_id=${encodeURIComponent(cityId)}`
    : `${apiBase}/sys_district`;

  // Get headers dengan priority: anonymous_id > service token
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


