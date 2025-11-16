'use client';

import Script from 'next/script';

export function GoogleAnalytics({ gaId }: { gaId?: string }) {
  if (!gaId) {
    return null;
  }

  const isLocalhost =
    typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const cookieDomain = isLocalhost ? 'localhost' : '.ngebengkel.com';
  const cookieFlags = isLocalhost ? '' : 'SameSite=None;Secure';

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              page_location: window.location.href,
              cookie_domain: '${cookieDomain}',
              cookie_flags: '${cookieFlags}',
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}


