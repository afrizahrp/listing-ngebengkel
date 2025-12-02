import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
    'https://ngebengkel.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/', // Allow static assets (fonts, CSS, JS, images)
        ],
        disallow: [
          '/api/', // proxy/API internal
          '/_next/data/', // Block Next.js data files
          '/admin/', // jaga kalau ada route internal
        ],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
    host: baseUrl,
  };
}


