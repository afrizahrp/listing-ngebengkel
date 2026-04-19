import type { Metadata } from 'next';
import { OwnerConversionLanding } from './components/owner-landing/OwnerConversionLanding';

const SITE = 'https://ngebengkel.com';

/** Page-level SEO — selaras H1 & copy beranda owner terbaru */
export const metadata: Metadata = {
  title: 'Bengkel ramai tapi duit nggak jelas? | Ngebengkel untuk owner Jakarta',
  description:
    'Owner bengkel mobil Jakarta: servis, stok, dan angka berantakan — capek nebak untung. Ngebengkel satu alur biar kebaca jelas; ada halaman diagnosa + WA gratis tanpa paket wajib.',
  keywords: [
    'bengkel mobil jakarta',
    'manajemen bengkel mobil',
    'bengkel ramai untung tidak jelas',
    'stok bengkel berantakan',
    'diagnosa bengkel',
    'operasional bengkel',
    'pertumbuhan bengkel',
    'software bengkel',
    'laporan bengkel',
    'ngebengkel',
    'ngebengkel.com',
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE,
    siteName: 'Ngebengkel.com',
    title: 'Bengkel ramai tapi duit nggak jelas? | Ngebengkel',
    description:
      'Servis, stok, angka rapi satu alur. Owner bengkel mobil Jakarta — cek /diagnosa, lanjut WA gratis.',
    images: [
      {
        url: `${SITE}/logo-circle.webp`,
        width: 1200,
        height: 630,
        alt: 'Ngebengkel — manajemen & operasional bengkel mobil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bengkel ramai tapi duit nggak jelas? | Ngebengkel',
    description:
      'Satu alur servis–stok–uang. Owner Jakarta — diagnosa singkat, WA gratis.',
    images: [`${SITE}/logo-circle.webp`],
    creator: '@ngebengkel',
    site: '@ngebengkel',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Ngebengkel.com',
      url: SITE,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/logo-circle.webp`,
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE}/#webpage`,
      url: SITE,
      name: 'Bengkel ramai tapi duit nggak jelas? | Ngebengkel untuk owner Jakarta',
      description:
        'Owner bengkel mobil Jakarta: servis, stok, dan angka berantakan. Ngebengkel nyambungin ke satu alur; lanjut /diagnosa dan WA tanpa komit.',
      isPartOf: { '@type': 'WebSite', url: SITE, name: 'Ngebengkel.com' },
      publisher: { '@id': `${SITE}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- JSON-LD standar untuk SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <OwnerConversionLanding />
    </>
  );
}
