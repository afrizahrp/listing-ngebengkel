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
  
  // Trim slug untuk menghilangkan spasi
  const waitingListId = params?.slug?.trim() || '';
  const target = `${apiBase}/waiting-list/${encodeURIComponent(waitingListId)}/claim`;

  try {
    const body = await request.json();

    // Extract anonymous_id dari header jika ada (untuk tracking)
    const anonymousId = request.headers.get('x-anonymous-id') || 
                        request.headers.get('X-Anonymous-Id');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Tambahkan anonymous_id ke header jika ada
    if (anonymousId) {
      headers['X-Anonymous-Id'] = anonymousId;
    }

    // Forward request body ke backend
    const response = await fetch(target, {
      method: 'POST',
      headers,
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
    console.error('[WaitingListClaim] Error proxying POST request:', error);
    return NextResponse.json(
      { 
        message: 'Gagal mengklaim bengkel',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 },
    );
  }
}

