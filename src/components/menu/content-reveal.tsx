"use client";

import type { ReactNode } from "react";
import { DURATION_BASE_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ShimmerBlock } from "./shimmer-block";

type Props = {
  ready: boolean;
  className?: string;
  roundedClassName?: string;
  children: ReactNode;
};

/**
 * Keeps children mounted (so media can load) and covers them with a shimmer
 * box until `ready`. Opacity-only swap (docs/05).
 */
export function ContentReveal({
  ready,
  className,
  roundedClassName = "rounded-card",
  children,
}: Props) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={ready ? "opacity-100" : "opacity-0"}
        style={{
          transitionProperty: "opacity",
          transitionDuration: `${String(DURATION_BASE_MS)}ms`,
          transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        }}
      >
        {children}
      </div>
      {!ready ? (
        <div className={cn("absolute inset-0 overflow-hidden", roundedClassName)}>
          <ShimmerBlock className="h-full w-full" />
        </div>
      ) : null}
    </div>
  );
}
