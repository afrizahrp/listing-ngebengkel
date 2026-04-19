import type { Metadata } from 'next';
import Link from 'next/link';

const SITE = 'https://ngebengkel.com';
const WA = '6282125411773';

function waLink(text: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
}

export const metadata: Metadata = {
  title: 'Diagnosa bengkel — operasi vs pertumbuhan | Ngebengkel',
  description:
    'Sortir masalah operasional (stok, nota, untung, delegasi) vs pertumbuhan (pelanggan baru & balik). Owner bengkel Jakarta — singkat, lanjut WhatsApp gratis.',
  keywords: [
    'diagnosa bengkel',
    'masalah operasional bengkel',
    'pertumbuhan bengkel',
    'stok bengkel jakarta',
    'nota bengkel',
    'untung bengkel mobil',
    'pelanggan bengkel',
    'ngebengkel',
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/diagnosa` },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE}/diagnosa`,
    siteName: 'Ngebengkel.com',
    title: 'Diagnosa bengkel — operasi vs pertumbuhan | Ngebengkel',
    description:
      'Pilah bocor dapur operasi vs macet omzet depan. Pilih kartu, lanjut WA — tanpa komit.',
    images: [
      {
        url: `${SITE}/logo-circle.webp`,
        width: 1200,
        height: 630,
        alt: 'Ngebengkel — diagnosa bengkel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diagnosa bengkel | Ngebengkel',
    description: 'Operasi dulu, pertumbuhan setelahnya. Lanjut WA gratis.',
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
      logo: { '@type': 'ImageObject', url: `${SITE}/logo-circle.webp` },
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE}/diagnosa#webpage`,
      url: `${SITE}/diagnosa`,
      name: 'Diagnosa bengkel — operasi vs pertumbuhan',
      description:
        'Halaman sortir masalah operasional vs pertumbuhan untuk owner bengkel mobil di Jakarta.',
      isPartOf: { '@type': 'WebSite', url: SITE, name: 'Ngebengkel.com' },
      publisher: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE}/diagnosa#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Beranda',
          item: SITE,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Diagnosa bengkel',
          item: `${SITE}/diagnosa`,
        },
      ],
    },
  ],
};

type Card = {
  id: string;
  problem: string;
  consequence: string;
  reinforce?: string;
  ctaVerb: string;
  wa: string;
};

const operational: Card[] = [
  {
    id: 'stok',
    problem: 'Rak bilang ada, catatan bilang beda.',
    consequence: 'Duit nempel di spare. Debat tiap minggu.',
    reinforce: 'Tim muter di pola yang sama.',
    ctaVerb: 'rapikan stok',
    wa: 'Halo Ngebengkel, stok rak vs catatan sering selisih — mau lihat cara rapikannya.',
  },
  {
    id: 'transaksi',
    problem: 'Nota, WA, transfer nggak nempel ke job.',
    consequence: 'Tutup bulan jadi nebak, bukan ngitung.',
    ctaVerb: 'rapikan nota & kas',
    wa: 'Halo Ngebengkel, nota & transaksi harian berantakan — mau lihat cara rapikannya.',
  },
  {
    id: 'untung',
    problem: 'Hall ramai, untung per job kabur.',
    consequence: 'Diskon & spare asal-asalan. Margin ngumpet.',
    ctaVerb: 'baca untung per job',
    wa: 'Halo Ngebengkel, untung per job susah kebaca — mau lihat cara bacanya.',
  },
  {
    id: 'owner',
    problem: 'Kamu nggak bisa minggat sehari, operasi goyang.',
    consequence: 'Keputusan numpuk di kepala kamu. Tim nunggu arahan.',
    ctaVerb: 'delegasi tanpa kacau',
    wa: 'Halo Ngebengkel, operasi masih nempel ke gue sendiri — mau lihat pola delegasi yang aman.',
  },
];

const growth: Card[] = [
  {
    id: 'baru',
    problem: 'Pelanggan baru jarang masuk.',
    consequence: 'Omzet muter di angka yang sama tiap bulan.',
    ctaVerb: 'buka jalan pelanggan baru',
    wa: 'Halo Ngebengkel, pelanggan baru susah — mau lihat cara buka jalannya.',
  },
  {
    id: 'balik',
    problem: 'Yang pernah servis jarang balik.',
    consequence: 'Cari baru terus. Biaya per orang naik.',
    reinforce: 'Kontak putus setelah bon.',
    ctaVerb: 'nahan pelanggan balik',
    wa: 'Halo Ngebengkel, pelanggan jarang balik — mau lihat cara nahan tanpa ribet admin.',
  },
];

export default function DiagnosaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- JSON-LD untuk SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    <div className="min-h-screen bg-[#0c1116] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(30,58,95,0.45),transparent_55%)]" />
      <main className="relative mx-auto w-full max-w-[26rem] px-4 py-8 pb-12 sm:max-w-lg sm:px-5 md:max-w-2xl md:px-6 md:py-12">
        <p className="text-base text-zinc-500">
          <Link href="/" className="text-amber-400/95 underline-offset-2 hover:underline">
            ← Beranda
          </Link>
        </p>

        <header className="mt-8">
          <h1 className="text-balance text-2xl font-bold leading-tight text-white sm:text-3xl">
            Kita mulai dari yang paling sering bocor
          </h1>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            Dua blok: operasi dulu, pertumbuhan setelahnya.
          </p>
          <p className="mt-2 text-base leading-relaxed text-zinc-400">
            Pilih yang paling kerasa buat kamu. Tiap kartu lanjut ke WA.
          </p>
        </header>

        <section className="mt-10" aria-labelledby="ops-title">
          <div className="mb-3 border-l-4 border-rose-500/70 pl-4">
            <h2
              id="ops-title"
              className="text-lg font-bold uppercase tracking-wide text-rose-200/90"
            >
              Masalah operasional
            </h2>
            <p className="mt-2 text-base leading-relaxed text-zinc-400">
              Depan rame, kasir &amp; gudang nggak enak. Untung susah kebaca.
            </p>
          </div>
          <ul className="mt-5 flex flex-col gap-4">
            {operational.map((b) => (
              <li
                key={b.id}
                id={b.id}
                className="scroll-mt-6 rounded-2xl border border-rose-500/15 bg-zinc-900/70 p-4 sm:p-5"
              >
                <p className="text-base font-semibold text-white">{b.problem}</p>
                <p className="mt-2 text-base leading-relaxed text-zinc-300">{b.consequence}</p>
                {b.reinforce ? (
                  <p className="mt-1.5 text-base leading-relaxed text-zinc-400">{b.reinforce}</p>
                ) : null}
                <Link
                  href={waLink(b.wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-base font-medium text-zinc-100 transition hover:bg-white/10"
                >
                  Lihat cara {b.ctaVerb} →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby="growth-title">
          <div className="mb-3 border-l-4 border-amber-500/70 pl-4">
            <h2
              id="growth-title"
              className="text-lg font-bold uppercase tracking-wide text-amber-200/90"
            >
              Masalah pertumbuhan
            </h2>
            <p className="mt-2 text-base leading-relaxed text-zinc-400">
              Omzet macet: pelanggan baru sepi, atau yang udah servis jarang balik.
            </p>
          </div>
          <ul className="mt-5 flex flex-col gap-4">
            {growth.map((b) => (
              <li
                key={b.id}
                id={b.id}
                className="scroll-mt-6 rounded-2xl border border-amber-500/15 bg-zinc-900/70 p-4 sm:p-5"
              >
                <p className="text-base font-semibold text-white">{b.problem}</p>
                <p className="mt-2 text-base leading-relaxed text-zinc-300">{b.consequence}</p>
                {b.reinforce ? (
                  <p className="mt-1.5 text-base leading-relaxed text-zinc-400">{b.reinforce}</p>
                ) : null}
                <Link
                  href={waLink(b.wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-base font-medium text-zinc-100 transition hover:bg-white/10"
                >
                  Lihat cara {b.ctaVerb} →
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 rounded-xl border border-zinc-700/80 bg-zinc-900/40 p-4 text-base leading-relaxed text-zinc-300">
            <p className="font-semibold text-zinc-100">Catatan singkat</p>
            <p>Masalah depan sering dikira cuma promosi.</p>
            <p>Kalau stok &amp; nota masih berantakan, janji ke pelanggan gampang jebol.</p>
            <p>Rapikan dalem dulu — jalan pertumbuhan biasanya ikut terbuka.</p>
          </div>
        </section>

        <section
          id="penutup"
          className="mt-10 rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-6"
          aria-labelledby="penutup-title"
        >
          <h2 id="penutup-title" className="text-xl font-bold text-white">
            Mau lihat beresnya di bengkel kamu?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            Ngopi bentar. Cocok lanjut, nggak cocok ya udah.
          </p>
          <p className="mt-2 text-base leading-relaxed text-zinc-400">
            Tap WhatsApp di bawah. Kita jelasin alur singkat di chat.
          </p>
          <p className="mt-2 text-base leading-relaxed text-zinc-500">
            Gratis. Tanpa komit. Mau stop kapan aja, silakan.
          </p>
          <div className="mt-5">
            <Link
              href={waLink(
                'Halo Ngebengkel, gue udah baca diagnosa (operasi + pertumbuhan). Mau lihat cara kerja & ngobrol singkat.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-manipulation inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#25D366] px-4 text-base font-semibold text-[#0c1116] hover:bg-[#20bd5a]"
            >
              Lihat cara kerja &amp; ngobrol →
            </Link>
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
