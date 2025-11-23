import { NextResponse } from 'next/server';
import { getApiHeaders } from '@/lib/utils/get-api-headers';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  // Use BACKEND_URL only (not NEXT_PUBLIC_API_URL) for server-side API routes
  const base = process.env.BACKEND_URL || 'http://127.0.0.1:4000';
  // Trim ID to remove any trailing spaces that might cause 404 errors
  const id = context.params.id.trim();

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  const target = `${apiBase}/sys_district/${encodeURIComponent(id)}`;

  // Get headers dengan priority: anonymous_id > service token
  const headers = await getApiHeaders(request);

  let res = await fetch(target, {
    headers,
    cache: 'no-store',
  });

  // If unauthorized dan pakai service token, coba refresh sekali
  if (res.status === 401 && headers['Authorization']) {
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


