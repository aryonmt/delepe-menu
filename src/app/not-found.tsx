import Link from "next/link";
import { strings } from "@/lib/fa/strings";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="brand-frame w-full max-w-md rounded-card bg-card px-8 py-12 text-center shadow-warm">
        <p className="ornament-divider font-display text-section text-ornament">
          ✦
        </p>
        <h1 className="font-display mt-6 text-hero text-foreground">
          {strings.errors.notFoundTitle}
        </h1>
        <p className="mt-4 text-body text-muted-foreground">
          {strings.errors.notFoundBody}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          {strings.public.homeLink}
        </Link>
      </div>
    </main>
  );
}
