"use client";

import { Button } from "@/components/ui/button";
import { strings } from "@/lib/fa/strings";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="brand-frame w-full max-w-md rounded-card bg-card px-8 py-12 text-center shadow-warm">
        <p className="ornament-divider font-display text-section text-ornament">
          ✦
        </p>
        <h1 className="font-display mt-6 text-hero text-foreground">
          {strings.errors.genericTitle}
        </h1>
        <p className="mt-4 text-body text-muted-foreground">
          {strings.errors.genericBody}
        </p>
        <Button className="mt-8" type="button" onClick={reset}>
          {strings.errors.retry}
        </Button>
      </div>
    </main>
  );
}
