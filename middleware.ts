import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

/**
 * Deteksi apakah string adalah format ID (CUID)
 */
function isLikelyId(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 20 || trimmed.length > 30) {
    return false;
  }
  return /^[a-z0-9]+$/.test(trimmed) && !trimmed.includes('-');
}

/**
 * Get service token untuk API call
 */
async function getServiceToken(): Promise<string | null> {
  try {
    const staticToken = process.env.LISTING_SERVICE_TOKEN?.trim();
    if (staticToken) return staticToken;

    const username = process.env.SERVICE_USERNAME?.trim();
    const serviceEmail = process.env.SERVICE_EMAIL?.trim();
    const password = process.env.SERVICE_PASSWORD?.trim();

    const identity = serviceEmail || username;
    if (!identity || !password) {
      return null;
    }

    const loginUrl = `${baseTrim}/api/auth/login`;
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
      return null;
    }

    const body = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      token?: string;
      accessToken?: string;
    };

    return body?.access_token || body?.token || body?.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * Check if slug exists as a pain point
 */
async function isPainPointSlug(slug: string): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200';
    const response = await fetch(`${apiUrl}/api/pain-points/${slug}`, {
      method: 'HEAD',
      cache: 'no-store',
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking pain point:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Ambil protocol dan host yang benar dari proxy (Nginx)
  const proto = requestHeaders.get('x-forwarded-proto') || 'https';
  const host = requestHeaders.get('host') || 'ngebengkel.com';

  const { pathname, search } = request.nextUrl;

  // ===== WWW → non-WWW redirect =====
  if (host.startsWith('www.')) {
    const newHost = host.replace('www.', '');
    const redirectUrl = `${proto}://${newHost}${pathname}${search}`;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // ===== Redirect /artikel/{slug} → /masalah/{slug} jika pain point ada =====
  if (pathname.startsWith('/artikel/')) {
    const slug = pathname.replace('/artikel/', '').split('/')[0].replace(/^seasonal-/, '');
    
    if (slug && await isPainPointSlug(slug)) {
      const redirectUrl = `${proto}://${host}/masalah/${slug}`;
      return NextResponse.redirect(redirectUrl, 301);
    }
  }

  // ===== Workshop ID → slug redirect =====
  const workshopMatch = pathname.match(/^\/workshop\/([^/]+)$/);
  if (workshopMatch) {
    const slugOrId = workshopMatch[1];

    if (isLikelyId(slugOrId)) {
      try {
        const token = await getServiceToken();
        if (token) {
          const res = await fetch(`${apiBase}/waiting-list/${encodeURIComponent(slugOrId)}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          });

          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            const workshop = data?.data || data;

            if (workshop?.id === slugOrId && workshop?.slug) {
              const redirectUrl = `${proto}://${host}/workshop/${workshop.slug}`;
              return NextResponse.redirect(redirectUrl, 301);
            }

            // Generate slug dari name jika slug kosong
            if (workshop?.id === slugOrId && workshop?.name && !workshop?.slug) {
              const generatedSlug = workshop.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');

              const redirectUrl = `${proto}://${host}/workshop/${generatedSlug}`;
              return NextResponse.redirect(redirectUrl, 301);
            }
          }
        }
      } catch (error) {
        console.error('Error in middleware redirect check:', error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};