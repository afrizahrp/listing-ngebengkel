import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000';

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  const target = `${apiBase}/anonymous-sessions`;

  try {
    const body = await request.json();

    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    // Forward response dengan status code yang sama
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        // Forward cookies dari backend jika ada
        ...(response.headers.get('set-cookie') && {
          'set-cookie': response.headers.get('set-cookie') || '',
        }),
      },
    });
  } catch (error) {
    console.error('[AnonymousSessions] Error proxying request:', error);
    return NextResponse.json(
      { error: 'Failed to initialize anonymous session' },
      { status: 500 },
    );
  }
}

