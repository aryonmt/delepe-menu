"use client";
import { useEffect, useState, type ReactNode } from "react";
import { toPersianDigits } from "@/lib/format/digits";
import { strings } from "@/lib/fa/strings";

type Props = { children: ReactNode; viewportRef: (node: HTMLDivElement | null) => void };

function clockLabel(now: Date): string {
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return toPersianDigits(`${hours}:${minutes}`);
}

/** Device chrome for the admin live preview (docs/07). */
export function PhoneFrame({ children, viewportRef }: Props) {
  const [clock, setClock] = useState(() => clockLabel(new Date()));

  useEffect(() => {
    const tick = () => setClock(clockLabel(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      data-testid="preview-frame"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-drawer border-4 border-foreground/25 bg-background shadow-lift"
    >
      <div
        className="relative flex h-11 shrink-0 items-center justify-center bg-card px-4"
        aria-hidden="true"
      >
        <span className="absolute start-4 text-[11px] font-bold text-foreground">{clock}</span>
        <span className="h-3.5 w-24 rounded-full bg-foreground/20" />
      </div>
      <div
        ref={viewportRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background"
        aria-label={strings.admin.preview}
      >
        {children}
      </div>
    </div>
  );
}
