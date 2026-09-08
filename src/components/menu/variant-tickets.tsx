"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { VariantDto } from "@/application/dtos";
import { formatPrice } from "@/lib/format/price";
import { strings } from "@/lib/fa/strings";

type Props = {
  variants: VariantDto[];
  /** Already includes the «از » prefix (formatPriceFrom). */
  minPriceLabel: string;
  disabled: boolean;
};

export function VariantTickets({ variants, minPriceLabel, disabled }: Props) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 30 };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center justify-between gap-2">
        <span
          className="font-display text-[17px] text-primary"
          data-testid="price"
        >
          {minPriceLabel}
        </span>
        <button
          type="button"
          data-testid="variant-toggle"
          disabled={disabled}
          aria-expanded={open}
          aria-label={open ? strings.public.collapseVariants : strings.public.expandVariants}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-card-2 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={spring}
            className="inline-flex"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={spring}
        className="overflow-hidden"
        inert={!open}
      >
        <ul
          className="mt-2 space-y-2 border-t border-line pt-2"
          data-testid="variant-list"
          aria-hidden={!open}
        >
          {variants.map((variant) => (
            <li
              key={variant.id}
              className="flex items-baseline justify-between gap-3 text-secondary"
            >
              <span className="text-foreground/85">{variant.name}</span>
              <span aria-hidden="true" className="flex-1 border-b border-dotted border-line/70" />
              <span className="font-display text-[15px] text-primary">
                {formatPrice(variant.price)}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}