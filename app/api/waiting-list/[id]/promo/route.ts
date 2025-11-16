import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

let cachedToken: string | null = null;
let cachedTokenExp: number | null = null;

async function getServiceToken(): Promise<string> {
  const staticToken = process.env.LISTING_SERVICE_TOKEN?.trim();
  if (staticToken) return staticToken;
  if (cachedToken && cachedTokenExp && Date.now() < cachedTokenExp) return cachedToken;

  const username = process.env.SERVICE_USERNAME?.trim();
  const serviceEmail = process.env.SERVICE_EMAIL?.trim();
  const password = process.env.SERVICE_PASSWORD?.trim();
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

  const identity = serviceEmail || username;
  if (!identity || !password) throw new Error('Missing SERVICE_EMAIL/SERVICE_USERNAME or SERVICE_PASSWORD');

  const loginUrl = `${base.replace(/\/+$/, '')}/api/auth/login`;
  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      identity.includes('@') ? { email: identity, password } : { username: identity, password },
    ),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Service login failed: ${res.status} ${err}`);
  }
  const body = await res.json().catch(() => ({} as any));
  const token: string | undefined = body?.access_token || body?.token || body?.accessToken;
  const expiresInSec: number | undefined = body?.expires_in || body?.expiresIn || body?.exp;
  if (!token) throw new Error('Service login did not return access token');
  cachedToken = token;
  cachedTokenExp =
    typeof expiresInSec === 'number'
      ? Date.now() + Math.max(0, expiresInSec - 30) * 1000
      : Date.now() + 5 * 60 * 1000;
  return token;
}

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';
  const id = context.params.id;

  let token: string;
  try {
    token = await getServiceToken();
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed to resolve service token' },
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
  if (res.status === 401) {
    try {
      cachedToken = null;
      cachedTokenExp = null;
      token = await getServiceToken();
      res = await fetch(target, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
    } catch {}
  }
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}


