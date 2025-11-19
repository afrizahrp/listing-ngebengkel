/**
 * Service Token Manager dengan Auto-Refresh
 * 
 * Handle service token dengan mekanisme refresh otomatis:
 * 1. Login untuk dapat access token + refresh token
 * 2. Cache access token dengan expiry
 * 3. Auto-refresh saat access token expired
 * 4. Retry login jika refresh token juga expired
 */

interface TokenCache {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp when access token expires
  refreshExpiresAt: number; // Timestamp when refresh token expires
}

// Global cache untuk service token (shared across requests)
let tokenCache: TokenCache | null = null;

/**
 * Get service token dengan auto-refresh
 */
export async function getServiceTokenWithRefresh(): Promise<string> {
  // 1. Check static token dari env (highest priority)
  const staticToken = process.env.LISTING_SERVICE_TOKEN?.trim();
  if (staticToken) {
    console.log('[ServiceToken] ⚠️ Using static token from env (auto-refresh DISABLED)');
    return staticToken;
  }

  // 2. Check cached token (masih valid)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60000) {
    const timeLeft = Math.floor((tokenCache.expiresAt - Date.now()) / 1000 / 60);
    const timeLeftSec = Math.floor((tokenCache.expiresAt - Date.now()) / 1000);
    console.log(`[ServiceToken] ✅ Using cached token (expires in ${timeLeft} minutes / ${timeLeftSec} seconds)`);
    // Return cached token jika masih valid (dengan buffer 1 menit)
    return tokenCache.accessToken;
  }

  // 2.5. Token expired, log info
  if (tokenCache && Date.now() >= tokenCache.expiresAt - 60000) {
    const expiredSeconds = Math.floor((Date.now() - tokenCache.expiresAt) / 1000);
    const expiredMinutes = Math.floor(expiredSeconds / 60);
    if (expiredSeconds > 0) {
      console.log(`[ServiceToken] ⏰ Cached token expired ${expiredSeconds} seconds (${expiredMinutes} minutes) ago, will refresh...`);
    } else {
      console.log(`[ServiceToken] ⏰ Cached token about to expire, will refresh...`);
    }
    
    // Log refresh token status
    const refreshTimeLeft = Math.floor((tokenCache.refreshExpiresAt - Date.now()) / 1000);
    const refreshTimeLeftMin = Math.floor(refreshTimeLeft / 60);
    if (refreshTimeLeft > 0) {
      console.log(`[ServiceToken] 📋 Refresh token still valid (expires in ${refreshTimeLeftMin} minutes / ${refreshTimeLeft} seconds)`);
    } else {
      console.log(`[ServiceToken] ⚠️ Refresh token also expired (${Math.abs(refreshTimeLeft)} seconds ago), will re-login`);
    }
  }

  // 3. Try refresh jika ada refresh token yang masih valid
  if (tokenCache && Date.now() < tokenCache.refreshExpiresAt) {
    const timeLeft = Math.floor((tokenCache.refreshExpiresAt - Date.now()) / 1000 / 60);
    const timeLeftSec = Math.floor((tokenCache.refreshExpiresAt - Date.now()) / 1000);
    console.log(`[ServiceToken] 🔄 Access token expired, refreshing... (refresh token expires in ${timeLeft} minutes / ${timeLeftSec} seconds)`);
    try {
      const refreshed = await refreshServiceToken(tokenCache.refreshToken);
      if (refreshed) {
        const newTimeLeft = Math.floor((refreshed.expiresAt - Date.now()) / 1000 / 60);
        const newTimeLeftSec = Math.floor((refreshed.expiresAt - Date.now()) / 1000);
        const newRefreshTimeLeft = Math.floor((refreshed.refreshExpiresAt - Date.now()) / 1000 / 60);
        console.log(`[ServiceToken] ✅ Token refreshed successfully!`);
        console.log(`[ServiceToken]    - New access token expires in ${newTimeLeft} minutes (${newTimeLeftSec} seconds)`);
        console.log(`[ServiceToken]    - New refresh token expires in ${newRefreshTimeLeft} minutes`);
        tokenCache = refreshed;
        return refreshed.accessToken;
      } else {
        console.warn('[ServiceToken] ⚠️ Refresh returned null, will re-login');
      }
    } catch (error) {
      console.warn('[ServiceToken] ⚠️ Failed to refresh service token, will re-login:', error);
      // Clear cache dan re-login
      tokenCache = null;
    }
  }

  // 4. Login untuk dapat token baru
  console.log('[ServiceToken] 🔐 Logging in service account...');
  const tokens = await loginServiceAccount();
  if (!tokens) {
    throw new Error('Failed to login service account');
  }

  // Update cache
  tokenCache = tokens;
  const expiresIn = Math.floor((tokens.expiresAt - Date.now()) / 1000 / 60);
  const expiresInSec = Math.floor((tokens.expiresAt - Date.now()) / 1000);
  const refreshExpiresIn = Math.floor((tokens.refreshExpiresAt - Date.now()) / 1000 / 60);
  const refreshExpiresInSec = Math.floor((tokens.refreshExpiresAt - Date.now()) / 1000);
  console.log(`[ServiceToken] ✅ Login successful!`);
  console.log(`[ServiceToken]    - Access token expires in ${expiresIn} minutes (${expiresInSec} seconds)`);
  console.log(`[ServiceToken]    - Refresh token expires in ${refreshExpiresIn} minutes (${refreshExpiresInSec} seconds)`);

  return tokens.accessToken;
}

/**
 * Login service account dan dapat access token + refresh token
 */
async function loginServiceAccount(): Promise<TokenCache | null> {
  const username = process.env.SERVICE_USERNAME?.trim();
  const serviceEmail = process.env.SERVICE_EMAIL?.trim();
  const password = process.env.SERVICE_PASSWORD?.trim();
  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

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
    accessToken?: string;
    access_token?: string;
    token?: string;
    refreshToken?: string;
    refresh_token?: string;
    expires_in?: number;
    expiresIn?: number;
    exp?: number;
    refreshExpiresIn?: number;
    refresh_expires_in?: number;
  };

  const accessToken =
    body?.accessToken || body?.access_token || body?.token;
  const refreshToken =
    body?.refreshToken || body?.refresh_token;
  
  // Extract expiry dari JWT token jika ada
  let expiresInSec: number | undefined =
    body?.expires_in || body?.expiresIn || body?.exp;
  
  // Jika tidak ada di response, decode JWT untuk dapat exp
  if (!expiresInSec && accessToken) {
    try {
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString(),
      );
      if (payload.exp) {
        expiresInSec = payload.exp - Math.floor(Date.now() / 1000);
      }
    } catch {
      // Ignore decode errors
    }
  }
  
  const refreshExpiresInSec =
    body?.refreshExpiresIn || body?.refresh_expires_in;

  if (!accessToken) {
    throw new Error('Service login did not return access token');
  }

  // Calculate expiry timestamps
  const now = Date.now();
  const expiresAt =
    typeof expiresInSec === 'number'
      ? now + (expiresInSec - 60) * 1000 // Buffer 1 menit
      : now + 23 * 60 * 60 * 1000; // Default 23 jam (jika JWT expires 1 hari)

  // Refresh token biasanya expires lebih lama (misalnya 7 hari)
  const refreshExpiresAt =
    typeof refreshExpiresInSec === 'number'
      ? now + (refreshExpiresInSec - 60) * 1000
      : now + 7 * 24 * 60 * 60 * 1000; // Default 7 hari

  return {
    accessToken,
    refreshToken: refreshToken || '', // Fallback empty string jika tidak ada
    expiresAt,
    refreshExpiresAt,
  };
}

/**
 * Refresh access token menggunakan refresh token
 */
async function refreshServiceToken(
  refreshToken: string,
): Promise<TokenCache | null> {
  if (!refreshToken) {
    console.log('[ServiceToken] ⚠️ No refresh token provided for refresh');
    return null;
  }

  const base =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

  const refreshUrl = `${base.replace(/\/+$/, '')}/api/auth/refresh`;
  console.log(`[ServiceToken] 🔄 Calling refresh endpoint: ${refreshUrl}`);
  
  const res = await fetch(refreshUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Refresh-Token': refreshToken, // Send refresh token in header (case-insensitive)
      'x-refresh-token': refreshToken, // Also send lowercase for compatibility
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    console.warn(`[ServiceToken] ⚠️ Refresh failed with status ${res.status}: ${errorText}`);
    // If refresh fails, return null to trigger re-login
    return null;
  }
  
  console.log(`[ServiceToken] ✅ Refresh endpoint responded with status ${res.status}`);

  const body = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
    access_token?: string;
    token?: string;
    refreshToken?: string;
    refresh_token?: string;
    expires_in?: number;
    expiresIn?: number;
    exp?: number;
    refreshExpiresIn?: number;
    refresh_expires_in?: number;
  };

  const accessToken =
    body?.accessToken || body?.access_token || body?.token;
  const newRefreshToken =
    body?.refreshToken || body?.refresh_token || refreshToken; // Use new or keep old

  if (!accessToken) {
    return null;
  }

  // Calculate expiry timestamps
  const now = Date.now();
  let expiresInSec: number | undefined =
    body?.expires_in || body?.expiresIn || body?.exp;
  
  // Jika tidak ada di response, decode JWT untuk dapat exp
  if (!expiresInSec && accessToken) {
    try {
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString(),
      );
      if (payload.exp) {
        expiresInSec = payload.exp - Math.floor(Date.now() / 1000);
      }
    } catch {
      // Ignore decode errors
    }
  }
  
  const refreshExpiresInSec =
    body?.refreshExpiresIn || body?.refresh_expires_in;

  const expiresAt =
    typeof expiresInSec === 'number'
      ? now + (expiresInSec - 60) * 1000 // Buffer 1 menit
      : now + 23 * 60 * 60 * 1000; // Default 23 jam

  // Refresh token expiry: decode dari refresh token atau default 7 hari
  let refreshExpiresAt: number;
  if (typeof refreshExpiresInSec === 'number') {
    refreshExpiresAt = now + (refreshExpiresInSec - 60) * 1000;
  } else if (newRefreshToken) {
    try {
      const payload = JSON.parse(
        Buffer.from(newRefreshToken.split('.')[1], 'base64').toString(),
      );
      if (payload.exp) {
        refreshExpiresAt = payload.exp * 1000 - 60000; // Convert to ms, buffer 1 menit
      } else {
        refreshExpiresAt = tokenCache?.refreshExpiresAt || now + 7 * 24 * 60 * 60 * 1000;
      }
    } catch {
      refreshExpiresAt = tokenCache?.refreshExpiresAt || now + 7 * 24 * 60 * 60 * 1000;
    }
  } else {
    refreshExpiresAt = tokenCache?.refreshExpiresAt || now + 7 * 24 * 60 * 60 * 1000;
  }

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresAt,
    refreshExpiresAt,
  };
}

/**
 * Clear token cache (untuk testing atau force re-login)
 */
export function clearServiceTokenCache(): void {
  tokenCache = null;
}

