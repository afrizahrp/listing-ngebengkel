import { NextResponse } from 'next/server';
import { getApiHeaders } from '@/lib/utils/get-api-headers';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000';

  let body: { ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 },
    );
  }

  if (!body.ids || !Array.isArray(body.ids)) {
    return NextResponse.json(
      { message: 'ids must be an array' },
      { status: 400 },
    );
  }

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  const target = `${apiBase}/sys_city/batch`;

  // Get headers dengan priority: anonymous_id > service token
  const headers = await getApiHeaders(request);

  let res = await fetch(target, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ids: body.ids }),
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
      method: 'POST',
      headers: newHeaders,
      body: JSON.stringify({ ids: body.ids }),
      cache: 'no-store',
    });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

