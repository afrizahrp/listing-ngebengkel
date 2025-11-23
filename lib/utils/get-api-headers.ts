/**
 * Utility untuk get headers untuk API calls
 * Priority: anonymous_id > service token
 */

import { getServiceTokenWithRefresh } from './service-token-manager';
import { ANONYMOUS_ID_COOKIE_NAME } from './anonymous-id';

/**
 * Get headers untuk API request
 * Priority:
 * 1. anonymous_id dari request (jika ada)
 * 2. Service token dengan auto-refresh (fallback)
 */
export async function getApiHeaders(
  request?: Request | null,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Try get anonymous_id dari request (jika ada)
  if (request) {
    try {
      // Priority 1: Header X-Anonymous-Id
      const anonymousIdHeader = request.headers.get('x-anonymous-id') || 
                                 request.headers.get('X-Anonymous-Id');
      
      // Priority 2: Cookie anonymous_id
      const cookieHeader = request.headers.get('cookie');
      let anonymousIdCookie: string | null = null;
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>);
        anonymousIdCookie = cookies[ANONYMOUS_ID_COOKIE_NAME] || null;
      }

      const anonymousId = anonymousIdHeader || anonymousIdCookie;

      if (anonymousId) {
        headers['X-Anonymous-Id'] = anonymousId;
        // Return early dengan anonymous_id
        return headers;
      }
    } catch (error) {
      // Silent fail, fallback ke service token
      console.warn('Failed to extract anonymous_id from request:', error);
    }
  }

  // Fallback: Service token dengan auto-refresh (jika anonymous_id tidak ada)
  try {
    const serviceToken = await getServiceTokenWithRefresh();
    if (serviceToken) {
      headers['Authorization'] = `Bearer ${serviceToken}`;
    }
  } catch (error) {
    // Silent fail - tidak ada service token
    console.warn('[getApiHeaders] Failed to get service token:', error);
  }

  return headers;
}

