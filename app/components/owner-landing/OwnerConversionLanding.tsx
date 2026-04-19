import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  Boxes,
  Link2,
  MessageCircle,
  StarOff,
  UserRound,
  Wallet,
} from 'lucide-react';

const WA_NUMBER = '6282125411773';
const WA_PREFILL = encodeURIComponent(
  'Halo Ngebengkel, saya owner bengkel. Mau curhat bentar soal operasional & angka — gratis dulu ya.',
);
const WA_CTA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_PREFILL}`;

/** 7 pain → consequence (sekali di halaman, format konsisten) */
const problemCards = [
  {
    icon: MessageCircle,
    text: 'Hall ramai mekanik muter → kamu nebak untung, bukan ngitung.',
  },
  {
    icon: StarOff,
    text: 'Review jelek tanpa detail → reputasi lecet, pelanggan balik nggak kejelasin.',
  },
  {
    icon: Boxes,
    text: 'Stok di rak beda sama Excel → duit nyangkut di spare + debat tim tiap habis minggu.',
  },
  {
    icon: UserRound,
    text: 'Owner nggak bisa minggat sehari → operasi nempel di kamu doang, susah naik kelas.',
  },

  {
    icon: Link2,
    text: 'Servis, gudang, kasir jalur beda → malem masih rekap, tidur bawa kerjaan.',
  },
  {
    icon: Wallet,
    text: 'Piutang cuma inget di kepala → tagihan jalan, kas kaget tiap awal bulan.',
  },
];

export function OwnerConversionLanding() {
  return (
    <>
      <div className="min-h-screen bg-[#0c1116] text-zinc-100">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(30,58,95,0.45),transparent_55%)]" />

        <main className="relative mx-auto w-full max-w-[26rem] px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-5 sm:pb-10 sm:pt-8 md:max-w-2xl md:px-6 md:pb-12">
          {/* 1. HERO */}
          <section aria-labelledby="hero-title" className="mb-14 sm:mb-20">
            <h1
              id="hero-title"
              className="text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl"
            >
              Bengkel ramai. Tapi duitnya gak jelas.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Buat owner bengkel mobil di Jakarta yang capek sama masalah harian. Servis, stok, dan
              angka jadi rapih — tanpa ribet.
            </p>
            <div className="mt-8">
              <Link
                href={WA_CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-manipulation inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-base font-medium text-white transition hover:bg-white/15"
              >
                Curhat bentar di WA — gratis
              </Link>
            </div>
          </section>

          {/* 2. AGITATION */}
          <section aria-labelledby="problems-title" className="mb-14 sm:mb-20">
            <h2 id="problems-title" className="text-2xl font-bold text-white">
              Ini bukan cuma &quot;ribet admin&quot; — tapi bocor halus
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Hampir semua owner ngalamin. Bedanya cuma seberapa sering.
            </p>
            <ul className="mt-8 flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
              {problemCards.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-950/50 text-rose-300">
                      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <p className="text-base leading-relaxed text-zinc-300">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            {/* <p className="mt-8 text-base leading-relaxed text-zinc-500">
              (Kalau yang kamu cari malah{' '}
              <Link
                href="/bengkel"
                className="font-medium text-amber-400/95 underline-offset-2 hover:underline"
              >
                listing buat pelanggan nyari bengkel
              </Link>
              , itu halaman lain — di sini khusus dapur operator.)
            </p> */}
          </section>

          {/* 3. VALUE PROPOSITION (before vs after — file names tetap di &quot;before&quot;) */}
          <section
            aria-labelledby="bridge-title"
            className="mb-14 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 sm:mb-20"
          >
            <h2 id="bridge-title" className="sr-only">
              Sebelum dan sesudah alur nyatu
            </h2>
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
              <div className="relative min-h-[200px] border-b border-white/10 p-6 md:border-b-0 md:border-r">
                <p className="text-base font-semibold uppercase tracking-wide text-rose-300/90">
                  Senin pagi sekarang
                </p>
                <div className="mt-5 space-y-2">
                  {[12, -6, 8, -10, 5].map((deg, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-rose-500/20 bg-rose-950/30 px-3 py-2 text-base text-rose-100/80 shadow-md"
                      style={{ transform: `rotate(${deg}deg) translateX(${i * 4}px)` }}
                    >
                      {i === 0 && 'Invoice #1294.xlsx'}
                      {i === 1 && 'WA mekanik: "spion kanan ambil dimana?"'}
                      {i === 2 && 'Stock sheet — revisi'}
                      {i === 3 && 'Memo bon kertas'}
                      {i === 4 && 'Reminder bayar supplier…'}
                    </div>
                  ))}
                </div>
                <AlertTriangle
                  className="absolute bottom-4 right-4 h-10 w-10 text-rose-500/30"
                  aria-hidden
                />
              </div>
              <div className="relative min-h-[200px] bg-emerald-950/20 p-6">
                <p className="text-base font-semibold uppercase tracking-wide text-emerald-300/90">
                  Senin pagi kalau udah kebaca
                </p>
                <div className="mt-5 rounded-xl border border-emerald-500/25 bg-[#0c1116]/80 p-4 shadow-inner">
                  <p className="text-base leading-relaxed text-zinc-300">
                    Kopi masih anget, kamu buka satu ringkasan: kemarin servis apa, stok kepotong
                    berapa, kas masih aman nggak buat minggu ini. Nggak perlu ngejar mekanik satu
                    satu buat &quot;versi benernya yang mana&quot; — angkanya udah ngantri rapi di
                    satu tempat.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 bg-zinc-950/40 p-4 sm:p-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-inner sm:aspect-video">
                <Image
                  src="/images/suasana_bengkel.webp"
                  alt="Suasana bengkel mobil"
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 672px"
                  priority={false}
                />
              </div>
            </div>
          </section>

          {/* 4. SOCIAL PROOF (placeholder — ganti quote asli nanti)
          <section aria-labelledby="social-title" className="mb-14 sm:mb-20">
            <h2 id="social-title" className="text-2xl font-bold text-white">
              Yang mereka bilang (contoh format)
            </h2>
            <p className="mt-2 text-base text-zinc-500">
              Dua template di bawah fiksi — silakan ganti quote + nama asli dari bengkel kamu.
            </p>
            <div className="mt-8 flex flex-col gap-6">
              <blockquote className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
                <p className="text-base leading-relaxed text-zinc-300">
                  &quot;Dulu selisih stok bisa ribut tiga kali seminggu. Sekarang mutasi kelihatan
                  jejaknya — ribut besarnya turun, yang nyisa debat receh doang.&quot;
                </p>
                <footer className="mt-4 text-base text-zinc-500">
                  — Pemilik Bengkel, Cempaka Putih
                </footer>
              </blockquote>
              <blockquote className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
                <p className="text-base leading-relaxed text-zinc-300">
                  &quot;Saya berhenti ngecek Excel malem-malem buat itung untung kira-kira. Pagi
                  buka ringkasan, angkanya udah nempel sama servis kemarin — hemat sekitar 5–7 jam
                  seminggu buat hal receh.&quot;
                </p>
                <footer className="mt-4 text-base text-zinc-500">
                  — Owner Bengkel Body & Umum, Bekasi Barat
                </footer>
              </blockquote>
            </div>
          </section> */}

          {/* 6. URGENCY (stakes lembut — biaya diam, bukan timer palsu) */}
          <section
            aria-labelledby="stakes-title"
            className="mb-14 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 sm:mb-20 sm:p-8"
          >
            <h2 id="stakes-title" className="text-2xl font-bold text-white">
              Tiga bulan lagi masih sistem yang sama?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-400">
              Berarti: capeknya sama, debatnya sama, dan duit yang bocor juga sama. Bukan soal
              modern atau enggak. Ini soal kebocoran yang terus kejadian.
            </p>
          </section>

          {/* 5. BRIDGE: apa itu Ngebengkel → diagnosa */}
          <section aria-labelledby="solution-title" className="mb-14 sm:mb-20">
            <h2 id="solution-title" className="text-2xl font-bold text-white">
              Apa aja yang bisa kami beresin di bengkel kamu?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Kami sambungin servis, stok, dan uang jadi satu alur. Biar gak nebak lagi — semua
              kelihatan jelas. Sekarang yang paling berantakan di mana?
            </p>

            <div className="mt-8">
              <Link
                href="/diagnosa"
                className="touch-manipulation inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-amber-500 px-5 text-base font-semibold text-[#0c1116] shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
              >
                Cek kondisi bengkel Saya
              </Link>
            </div>
          </section>

          {/* 7. CTA */}
          <section
            aria-labelledby="cta-wa-title"
            className="rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/30 to-zinc-900/90 p-6 sm:p-8"
          >
            <h2 id="cta-wa-title" className="text-2xl font-bold text-white">
              Mulai dari WhatsApp aja
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-400">
              Cerita dikit soal kondisi bengkel kamu. Kami respon secepatnya — tanpa ribet.
            </p>

            <div className="mt-8">
              <Link
                href={WA_CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-manipulation inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-base font-semibold text-[#0c1116] shadow-lg shadow-[#25D366]/20 transition hover:bg-[#20bd5a] active:scale-[0.99]"
                aria-label="Buka WhatsApp ke Ngebengkel — gratis"
              >
                <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
                Lanjut ke WhatsApp
              </Link>
              <p className="mt-3 text-center text-base text-emerald-200/90">
                Gratis. Kami usahakan bales cepat di jam kerja.
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
