import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
const baseTrim = base.replace(/\/+$/, '');
const apiBase = baseTrim.endsWith('/api') ? baseTrim : `${baseTrim}/api`;

/**
 * Deteksi apakah string adalah format ID (CUID)
 * CUID biasanya 21-25 karakter, hanya alphanumeric lowercase
 */
function isLikelyId(value: string): boolean {
  const trimmed = value.trim();
  // CUID biasanya 21-25 karakter, hanya alphanumeric
  // Tidak mengandung dash atau karakter khusus
  if (trimmed.length < 20 || trimmed.length > 30) {
    return false;
  }
  // CUID hanya mengandung alphanumeric lowercase
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';
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
  // ===== WWW to non-WWW redirect =====
  const hostname = request.headers.get('host') || '';
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(request.url);
    newUrl.host = hostname.replace('www.', '');
    return NextResponse.redirect(newUrl, { status: 301 });
  }
  // ===== End WWW redirect =====

  const { pathname } = request.nextUrl;

  // ===== Redirect /artikel/{slug} to /masalah/{slug} if pain point exists =====
  if (pathname.startsWith('/artikel/')) {
    const slug = pathname.replace('/artikel/', '').split('/')[0].replace(/^seasonal-/, '');
    
    if (slug && await isPainPointSlug(slug)) {
      const newUrl = new URL(`/masalah/${slug}`, request.url);
      return NextResponse.redirect(newUrl, { status: 301 });
    }
  }
  // ===== End artikel redirect =====

  // Hanya handle route workshop/[slug] yang terlihat seperti ID
  const workshopMatch = pathname.match(/^\/workshop\/([^/]+)$/);
  if (!workshopMatch) {
    return NextResponse.next();
  }

  const slugOrId = workshopMatch[1];

  // Jika tidak seperti format ID, skip
  if (!isLikelyId(slugOrId)) {
    return NextResponse.next();
  }

  // Cek apakah ini benar-benar ID dengan fetch ke API
  try {
    const token = await getServiceToken();
    if (!token) {
      return NextResponse.next();
    }

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

      // Pastikan ini benar-benar ID yang match
      if (workshop?.id === slugOrId && workshop?.slug) {
        // Redirect 301 permanent ke URL slug
        const newUrl = new URL(`/workshop/${workshop.slug}`, request.url);
        return NextResponse.redirect(newUrl, { status: 301 });
      }

      // Jika tidak ada slug tapi ada name, generate slug (menggunakan createSlug logic)
      if (workshop?.id === slugOrId && workshop?.name && !workshop?.slug) {
        // Gunakan logika yang sama dengan createSlug di lib/utils/slug.ts
        const generatedSlug = workshop.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
        const newUrl = new URL(`/workshop/${generatedSlug}`, request.url);
        return NextResponse.redirect(newUrl, { status: 301 });
      }
    }
  } catch (error) {
    // Jika error, biarkan proses lanjut
    console.error('Error in middleware redirect check:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};