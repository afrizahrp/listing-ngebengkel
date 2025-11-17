import type { MetadataRoute } from 'next';

type WaitingListItem = {
  id: string;
  updatedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
    'https://ngebengkel.com';

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Tambahkan halaman detail workshop dari daftar WL (opsional/tergantung koneksi)
  try {
    const res = await fetch(`${baseUrl}/api/waiting-list`, {
      // Sitemap dipanggil di server, tidak perlu kredensial browser
      headers: { 'Content-Type': 'application/json' },
      // Cache agar tidak menekan origin
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        data?: WaitingListItem[];
      } | WaitingListItem[];
      const items: WaitingListItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      for (const item of items) {
        routes.push({
          url: `${baseUrl}/workshop/${encodeURIComponent(item.id)}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch {
    // Abaikan error agar sitemap tetap ter-generate minimal untuk halaman utama
  }

  return routes;
}


