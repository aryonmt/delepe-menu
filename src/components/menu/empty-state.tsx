import { strings } from "@/lib/fa/strings";

export function EmptyState() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="brand-frame w-full max-w-md rounded-card bg-card px-8 py-12 text-center shadow-warm">
        <p className="ornament-divider font-display text-section text-ornament">
          ✦
        </p>
        <h1 className="font-display mt-6 text-hero text-foreground">
          {strings.public.emptyTitle}
        </h1>
        <p className="mt-4 text-body text-muted-foreground">
          {strings.public.emptyHint}
        </p>
      </div>
      <p className="mt-10 text-secondary text-muted-foreground">
        {strings.public.footer}
      </p>
    </main>
  );
}
