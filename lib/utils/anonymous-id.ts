/**
 * Utility untuk manage Anonymous Session (Device-Based ID)
 * 
 * Generate anonymous_id (UUID v4) dan simpan ke:
 * - Cookie (HTTP-only preferred) - via API route
 * - localStorage (fallback) - client-side
 */

const ANONYMOUS_ID_KEY = 'anonymous_id';
/**
 * Cookie name untuk anonymous_id (HTTP-only cookie)
 * Digunakan oleh backend untuk set cookie, dan oleh frontend untuk referensi
 */
export const ANONYMOUS_ID_COOKIE_NAME = 'anonymous_id';

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get anonymous_id dari localStorage (client-side)
 */
export function getAnonymousIdFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(ANONYMOUS_ID_KEY);
  } catch (error) {
    console.warn('Failed to read anonymous_id from localStorage:', error);
    return null;
  }
}

/**
 * Set anonymous_id ke localStorage (client-side)
 */
export function setAnonymousIdToStorage(anonymousId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
  } catch (error) {
    console.warn('Failed to save anonymous_id to localStorage:', error);
  }
}

/**
 * Get atau generate anonymous_id
 * Priority: localStorage > generate new
 */
export function getOrCreateAnonymousId(): string {
  // Try get from localStorage
  let anonymousId = getAnonymousIdFromStorage();

  // If not found, generate new
  if (!anonymousId) {
    anonymousId = generateUUID();
    setAnonymousIdToStorage(anonymousId);
  }

  return anonymousId;
}

/**
 * Initialize anonymous session dengan backend
 * Call ini saat app pertama kali load untuk register anonymous_id ke backend
 */
export async function initializeAnonymousSession(
  source: 'web' | 'app' | 'mobile' = 'web',
): Promise<string> {
  const anonymousId = getOrCreateAnonymousId();

  try {
    // Call backend API untuk create/register anonymous session
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
    const apiUrl = `${baseUrl}/api/anonymous-sessions`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        anonymousId,
        source,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to initialize anonymous session:', response.status);
      // Return anonymousId anyway (fallback)
      return anonymousId;
    }

    await response.json();
    // Backend akan set cookie jika bisa
    return anonymousId;
  } catch (error) {
    console.warn('Error initializing anonymous session:', error);
    // Return anonymousId anyway (fallback)
    return anonymousId;
  }
}

/**
 * Get anonymous_id untuk digunakan di API calls
 */
export function getAnonymousId(): string | null {
  return getOrCreateAnonymousId();
}

/**
 * Clear anonymous_id (untuk testing atau logout)
 */
export function clearAnonymousId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(ANONYMOUS_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear anonymous_id from localStorage:', error);
  }
}

/**
 * Check apakah anonymous_id valid (format UUID v4)
 */
export function isValidAnonymousId(id: string | null): boolean {
  if (!id) {
    return false;
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

