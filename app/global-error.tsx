'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">500</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Terjadi Kesalahan Server
            </h2>
            <p className="text-gray-500 mb-6">
              Maaf, terjadi kesalahan pada server kami. Silakan coba lagi beberapa saat.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 mb-4 font-mono">Error ID: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
