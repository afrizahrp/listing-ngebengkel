import { NextResponse } from 'next/server';

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
    'http://127.0.0.1:4000';
  const id = context.params.id;

  // Log untuk debugging
  console.log(`[sys_province] Fetching province with ID: ${id}`);

  let token: string;
  try {
    token = await getServiceToken();
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to resolve service token';
    console.error(`[sys_province] Token error:`, message);
    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  const target = `${apiBase}/sys_province/${encodeURIComponent(id)}`;

  console.log(`[sys_province] Fetching from: ${target}`);

  let res: Response;
  try {
    res = await fetch(target, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    console.log(`[sys_province] Response status: ${res.status}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to fetch province';
    console.error(`[sys_province] Network error:`, message);
    return NextResponse.json(
      { message, error: 'Network Error' },
      { status: 500 },
    );
  }

  // Handle 401 - retry with fresh token
  if (res.status === 401) {
    console.log(`[sys_province] 401 Unauthorized, refreshing token...`);
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
      console.log(`[sys_province] Retry response status: ${res.status}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to refresh token';
      console.error(`[sys_province] Token refresh error:`, message);
      return NextResponse.json(
        { message, error: 'Unauthorized' },
        { status: 401 },
      );
    }
  }

  // Handle error responses
  if (!res.ok) {
    let errorData: any;
    let errorText: string = '';
    try {
      errorText = await res.text();
      console.error(`[sys_province] Backend error response text:`, errorText.substring(0, 500));
      
      if (errorText) {
        try {
          errorData = JSON.parse(errorText);
          console.error(`[sys_province] Backend error (${res.status}):`, JSON.stringify(errorData, null, 2));
        } catch (parseError) {
          console.error(`[sys_province] Failed to parse error JSON:`, parseError);
          errorData = { 
            message: errorText.substring(0, 200) || `Backend returned ${res.status}`,
            raw: errorText.substring(0, 500),
          };
        }
      } else {
        errorData = { message: `Backend returned ${res.status} with empty response` };
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      console.error(`[sys_province] Failed to read error response:`, errMsg);
      errorData = { message: `Backend returned ${res.status}`, error: errMsg };
    }
    
    // Extract message dari error response (bisa berupa string atau array)
    let errorMessage = 'Unknown error';
    if (errorData.message) {
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message[0] || 'Unknown error';
      } else {
        errorMessage = errorData.message;
      }
    } else if (errorData.statusCode === 404 || res.status === 404) {
      errorMessage = `Province dengan ID ${id} tidak ditemukan`;
    }
    
    // Jika backend return 500, mungkin ID tidak ditemukan atau ada error di backend
    // Tapi karena data ada, kemungkinan ada masalah lain
    const status = res.status;
    return NextResponse.json(
      { 
        message: errorMessage,
        error: errorData.error || 'Request failed',
        statusCode: errorData.statusCode || status,
        ...(process.env.NODE_ENV === 'development' ? { 
          details: errorData,
          path: errorData.path,
          timestamp: errorData.timestamp,
        } : {}),
      },
      { status },
    );
  }

  // Success response
  try {
    const data = await res.json();
    console.log(`[sys_province] Success: Found province data`);
    return NextResponse.json(data, { status: 200 });
  } catch (e: unknown) {
    console.error(`[sys_province] Failed to parse success response:`, e);
    return NextResponse.json(
      { message: 'Failed to parse response', error: 'Parse Error' },
      { status: 500 },
    );
  }
}


