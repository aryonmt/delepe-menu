"use client";

import { motion, useReducedMotion } from "motion/react";
import { strings } from "@/lib/fa/strings";

export function EmptyState() {
  const reduceMotion = useReducedMotion();
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[80px]"
        style={{ background: "radial-gradient(circle, var(--glow) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <motion.div
        className="card-surface relative w-full max-w-md rounded-card px-8 py-12"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div className="mb-4 flex items-center justify-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span key={index} className="h-3 w-1 rotate-[18deg] rounded-full bg-primary" />
          ))}
        </div>
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">
          {strings.public.emptyTitle}
        </h1>
        <p className="mt-2.5 text-body text-muted-foreground">{strings.public.emptyHint}</p>
      </motion.div>
      <p className="mt-8 text-xs text-muted-foreground/70">{strings.public.footer}</p>
    </main>
  );
}