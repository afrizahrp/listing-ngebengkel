'use client';

import { useEffect } from 'react';

export function GoogleSearchConsoleVerification() {
  useEffect(() => {
    const existingMeta = document.querySelector(
      'meta[name="google-site-verification"]'
    );
    if (!existingMeta) {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = '-kDq-qfEa-I1RlrzQE4xTZaPzJlncPlFoGG22jKbXgc';
      document.head.appendChild(meta);
    }
  }, []);

  return null;
}


