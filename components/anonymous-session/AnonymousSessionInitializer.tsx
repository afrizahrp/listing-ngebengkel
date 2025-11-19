'use client';

import { useEffect } from 'react';
import { initializeAnonymousSession } from '@/lib/utils/anonymous-id';

/**
 * Client component untuk initialize anonymous session
 * Mount sekali saat app load
 */
export function AnonymousSessionInitializer() {
  useEffect(() => {
    // Initialize anonymous session saat component mount
    initializeAnonymousSession('web').catch((error) => {
      console.warn('Failed to initialize anonymous session:', error);
      // Silent fail - anonymous_id tetap bisa digunakan dari localStorage
    });
  }, []);

  // Component ini tidak render apapun
  return null;
}

