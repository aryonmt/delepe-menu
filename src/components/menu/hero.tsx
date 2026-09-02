"use client";

import { useEffect, useState } from "react";
import { strings } from "@/lib/fa/strings";

type Props = {
  restaurantName: string;
};

export function Hero({ restaurantName }: Props) {
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsShrunk(window.scrollY > 80);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="relative flex h-[200px] w-full items-center justify-center overflow-hidden border-b border-border bg-background"
      data-testid="hero"
    >
      {/* drifting radial glows - transform only, 12s loop */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--ornament) 0%, transparent 70%)",
          animation: "hero-drift 12s ease-in-out infinite alternate",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          animation: "hero-drift 12s ease-in-out infinite alternate-reverse",
        }}
        aria-hidden="true"
      />
      {/* TODO(M7): layout height 200→120 cannot be transform-only; A-07 shrink is scale/opacity on the inner frame. */}
      <div
        className={`brand-frame relative flex flex-col items-center justify-center rounded-card bg-card px-8 py-6 shadow-warm transition-[transform,opacity] duration-300 ${isShrunk ? "scale-90 opacity-90" : "scale-100 opacity-100"}`}
      >
        <p className="ornament-divider font-display text-sm text-ornament" aria-hidden="true">
          ✦
        </p>
        <h1 className="font-display mt-2 text-center text-hero font-bold text-foreground md:text-[40px]">
          {restaurantName}
        </h1>
        <p className="mt-1 text-secondary text-muted-foreground">{strings.public.subtitle}</p>
      </div>
      <style>{`@keyframes hero-drift { from { transform: translate3d(0,0,0); } to { transform: translate3d(20px, 12px, 0); } } @media (prefers-reduced-motion: reduce) { [style*="hero-drift"] { animation: none !important; } }`}</style>
    </header>
  );
}
