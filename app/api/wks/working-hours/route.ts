import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

let cachedToken: string | null = null;
let cachedTokenExp: number | null = null;

async function getServiceToken(): Promise<string> {
  const staticToken = process.env.LISTING_SERVICE_TOKEN?.trim();
  if (staticToken) return staticToken;

  if (cachedToken && cachedTokenExp && Date.now() < cachedTokenExp) {
    return cachedToken;
  }

  const username = process.env.SERVICE_USERNAME?.trim();
  const serviceEmail = process.env.SERVICE_EMAIL?.trim();
  const password = process.env.SERVICE_PASSWORD?.trim();
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000';

  const identity = serviceEmail || username;

  if (!identity || !password) {
    throw new Error('Missing SERVICE_EMAIL/SERVICE_USERNAME or SERVICE_PASSWORD');
  }

  const loginUrl = `${base.replace(/\/+$/, '')}/api/auth/login`;
  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      identity.includes('@')
        ? { email: identity, password }
        : { username: identity, password },
    ),
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Service login failed: ${res.status} ${err}`);
  }

  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    token?: string;
    accessToken?: string;
    expires_in?: number;
    expiresIn?: number;
    exp?: number;
  };
  const token: string | undefined =
    body?.access_token || body?.token || body?.accessToken;
  const expiresInSec: number | undefined =
    body?.expires_in || body?.expiresIn || body?.exp;

  if (!token) {
    throw new Error('Service login did not return access token');
  }

  cachedToken = token;
  cachedTokenExp =
    typeof expiresInSec === 'number'
      ? Date.now() + Math.max(0, expiresInSec - 30) * 1000
      : Date.now() + 5 * 60 * 1000;

  return token;
}

export async function GET(request: NextRequest) {
  try {
    const base =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:4000';
    
    const { searchParams } = new URL(request.url);
    const waitingListId = searchParams.get('waitingListId')?.trim();
    const branchId = searchParams.get('branchId')?.trim();
    const companyId = searchParams.get('companyId')?.trim();

    let token: string;
    try {
      token = await getServiceToken();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to resolve service token';
      return NextResponse.json(
        { message },
        { status: 500 },
      );
    }

    const params = new URLSearchParams();
    if (waitingListId) params.append('waitingListId', waitingListId);
    if (branchId) params.append('branchId', branchId);
    if (companyId) params.append('companyId', companyId);

    const queryString = params.toString();
    const baseTrim = base.replace(/\/+$/, '');
    const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
    const url = `${apiBase}/wks/working-hours${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (response.status === 401) {
      try {
        cachedToken = null;
        cachedTokenExp = null;
        token = await getServiceToken();
        const retryResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });
        const data = await retryResponse.json().catch(() => ({}));
        return NextResponse.json(data, { status: retryResponse.status });
      } catch {
        // fallthrough
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch working hours' }));
      return NextResponse.json(
        { error: error.message || 'Gagal memuat jam kerja' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memuat jam kerja' },
      { status: 500 },
    );
  }
}




