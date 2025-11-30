import { Suspense } from "react";
import { CTA } from "./workshop/components/CTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <CTA variant="section" />
      </Suspense>
    </main>
  );
}
