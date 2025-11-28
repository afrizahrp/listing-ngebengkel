import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:4000';

  const baseTrim = base.replace(/\/+$/, '');
  const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;
  
  const waitingListId = params?.slug?.trim() || '';
  const target = `${apiBase}/waiting-list/${encodeURIComponent(waitingListId)}/claim/verify`;

  try {
    const body = await request.json();

    const anonymousId = request.headers.get('x-anonymous-id') || 
                        request.headers.get('X-Anonymous-Id');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (anonymousId) {
      headers['X-Anonymous-Id'] = anonymousId;
    }

    const response = await fetch(target, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        ...(response.headers.get('set-cookie') && {
          'set-cookie': response.headers.get('set-cookie') || '',
        }),
      },
    });
  } catch (error) {
    console.error('[WaitingListClaimVerify] Error proxying POST request:', error);
    return NextResponse.json(
      { 
        message: 'Gagal memverifikasi kode OTP',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 },
    );
  }
}

