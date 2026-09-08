"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { shouldInferInputDir, textDirection } from "@/lib/text-direction";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, dir, onInput, value, defaultValue, ...props }, ref) => {
    const infer = dir === undefined && shouldInferInputDir(type);
    const seed = value ?? defaultValue;
    const resolvedDir = infer
      ? textDirection(seed == null ? "" : String(seed))
      : dir;

    return (
      <input
        type={type}
        dir={resolvedDir}
        className={cn(
          "flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onInput={(event) => {
          if (infer) {
            event.currentTarget.dir = textDirection(event.currentTarget.value);
          }
          onInput?.(event);
        }}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
