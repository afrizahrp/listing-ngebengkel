import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
    'https://ngebengkel.com';

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    rules: isProduction
      ? [
          {
            userAgent: '*',
            allow: [
              '/',
              '/bengkel/', // Allow workshop listings
              '/masalah/', // Allow pain point pages
              '/artikel/', // Allow article pages
              '/_next/static/', // Allow static assets (fonts, CSS, JS)
              '/_next/image/', // Allow Next.js optimized images
            ],
            disallow: [
              '/api/', // Block API routes
              '/_next/data/', // Block Next.js data files
              '/admin/', // Block admin routes
              '/dashboard/', // Block dashboard if exists
              '/*.json$', // Block JSON files
              '/*?*sort=*', // Block filtered pages (duplicate content)
              '/*?*filter=*', // Block filter params
              '/*?*page=*', // Block pagination params (use canonical URLs)
            ],
          },
          // Optional: Block AI scrapers (remove if you want AI to access your content)
          {
            userAgent: [
              'GPTBot', // OpenAI
              'ChatGPT-User', // ChatGPT
              'CCBot', // Common Crawl
              'anthropic-ai', // Claude
              'Claude-Web', // Claude
              'Google-Extended', // Google Bard
            ],
            disallow: ['/'],
          },
        ]
      : [
          // Block everything in development/staging
          {
            userAgent: '*',
            disallow: ['/'],
          },
        ],
    sitemap: isProduction ? `${baseUrl}/sitemap.xml` : undefined,
    // Removed 'host' - it's deprecated in robots.txt spec
  };
}