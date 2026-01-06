import { Suspense } from "react";
import { CTA } from "./workshop/components/CTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Breadcrumb Navigation */}
      {/* <div className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 lg:px-0">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            href="/hub/masalah"
            className="hover:text-foreground transition-colors flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Masalah Kendaraan</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href="/hub/artikel"
            className="hover:text-foreground transition-colors flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <FileText className="h-4 w-4" />
            <span>Artikel & Panduan</span>
          </Link>
        </nav>
      </div> */}

      <Suspense fallback={<div>Loading...</div>}>
        <CTA variant="section" />
      </Suspense>
    </main>
  );
}
