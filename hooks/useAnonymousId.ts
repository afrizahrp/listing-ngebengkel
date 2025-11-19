import { useEffect, useState } from 'react';
import {
  getOrCreateAnonymousId,
  initializeAnonymousSession,
  getAnonymousId,
} from '@/lib/utils/anonymous-id';

/**
 * Hook untuk manage anonymous_id
 * Auto-initialize saat component mount
 */
export function useAnonymousId() {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize anonymous session
    const init = async () => {
      try {
        const id = await initializeAnonymousSession('web');
        setAnonymousId(id);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize anonymous session:', error);
        // Fallback: use local storage
        const localId = getOrCreateAnonymousId();
        setAnonymousId(localId);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  return {
    anonymousId,
    isInitialized,
    // Helper untuk get current anonymous_id
    getCurrentId: () => anonymousId || getAnonymousId(),
  };
}

