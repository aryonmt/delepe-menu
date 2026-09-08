"use client";

import { useMemo } from "react";
import type { ProductDto } from "@/application/dtos";
import { formatPrice } from "@/lib/format/price";
import { strings } from "@/lib/fa/strings";

type Props = {
  /** Up to TICKER_MAX_ITEMS available products — presentation only. */
  items: ProductDto[];
  onJump: (product: ProductDto) => void;
};

const CHIP_CLASS =
  "flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border " +
  "border-line bg-card/75 px-4 transition-colors duration-fast " +
  "hover:border-primary/60 hover:bg-card " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DishTicker({ items, onJump }: Props) {
  // Ensure the track never runs out of content, even on very wide screens.
  // MUST be called before any early returns (Rules of Hooks).
  const sequence = useMemo(() => {
    let list = items;
    while (list.length < 8) {
      list = [...list, ...items];
    }
    return list;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={strings.public.tickerAria}
      data-testid="hero-ticker"
      className="ticker border-t border-line bg-background/70 backdrop-blur-md select-none"
    >
      {/* ltr container flow so dual tracks cycle right-to-left seamlessly */}
      <div className="flex w-full overflow-hidden" dir="ltr">
        {/* Track 1 (primary) */}
        <div className="ticker-track flex shrink-0 items-center gap-2.5 pe-2.5 py-2">
          {sequence.map((product, index) => (
            <button
              key={`t1-${product.id}-${index}`}
              type="button"
              dir="rtl"
              onClick={() => onJump(product)}
              className={CHIP_CLASS}
            >
              <span className="font-display whitespace-nowrap text-[13.5px] text-foreground">
                {product.name}
              </span>
              <span aria-hidden="true" className="text-[10px] text-ornament">
                ،
              </span>
              <span className="whitespace-nowrap text-secondary text-primary font-bold">
                {formatPrice(product.price)}
              </span>
            </button>
          ))}
        </div>

        {/* Track 2 (seamless duplicate — aria-hidden) */}
        <div
          aria-hidden="true"
          className="ticker-track flex shrink-0 items-center gap-2.5 pe-2.5 py-2"
        >
          {sequence.map((product, index) => (
            <button
              key={`t2-${product.id}-${index}`}
              type="button"
              tabIndex={-1}
              dir="rtl"
              onClick={() => onJump(product)}
              className={CHIP_CLASS}
            >
              <span className="font-display whitespace-nowrap text-[13.5px] text-foreground">
                {product.name}
              </span>
              <span aria-hidden="true" className="text-[10px] text-ornament">
                ،
              </span>
              <span className="whitespace-nowrap text-secondary text-primary font-bold">
                {formatPrice(product.price)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}