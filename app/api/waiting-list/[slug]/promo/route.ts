import { NextResponse } from 'next/server';
import { getServiceTokenWithRefresh, clearServiceTokenCache } from '@/lib/utils/service-token-manager';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: { slug: string } },
) {
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000';
  const id = context.params.slug;

  let token: string;
  try {
    // Get token dengan auto-refresh mechanism
    token = await getServiceTokenWithRefresh();
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to resolve service token';
    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  const target = `${apiBase}/waiting-list/${encodeURIComponent(id)}/promo`;

  let res = await fetch(target, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  // If unauthorized, clear cache dan retry sekali
  if (res.status === 401) {
    try {
      clearServiceTokenCache();
      token = await getServiceTokenWithRefresh();
      res = await fetch(target, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
    } catch (error) {
      // If retry also fails, return error
      console.error('Failed to refresh service token:', error);
    }
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


