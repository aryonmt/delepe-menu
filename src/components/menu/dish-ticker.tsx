// src/components/menu/dish-ticker.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import type { ProductDto } from "@/application/dtos";
import { mediaUrl } from "@/lib/media-url";
import { formatPrice } from "@/lib/format/price";
import { preloadImage } from "@/lib/menu-boot";
import { strings } from "@/lib/fa/strings";
import { ShimmerBlock } from "./shimmer-block";

type Props = {
  /** Curated-or-fallback available products (docs/06 B-10). */
  items: ProductDto[];
  onJump: (product: ProductDto) => void;
};

const CHIP_CLASS =
  "flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-line " +
  "bg-card/75 ps-1.5 pe-4 transition-colors duration-fast hover:border-primary/60 " +
  "hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Decorative 36px thumb: background-image keeps `img[alt]` contracts intact (B-12). */
function Thumb({ product }: { product: ProductDto }) {
  const [ready, setReady] = useState(!product.media);
  useEffect(() => {
    if (!product.media) {
      setReady(true);
      return;
    }
    void preloadImage(mediaUrl(product.media.id, 320)).then(() => setReady(true));
  }, [product.media]);
  if (!product.media) {
    return (
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-card-2 font-display text-[15px] text-ornament opacity-70"
      >
        ✦
      </span>
    );
  }
  return (
    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line">
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-center bg-cover ${ready ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: `url(${mediaUrl(product.media.id, 320)})`,
          backgroundColor: product.media.dominantColor,
        }}
      />
      {!ready ? <ShimmerBlock className="absolute inset-0 rounded-full" /> : null}
    </span>
  );
}

function TrackChip({
  product,
  onJump,
  hidden,
}: {
  product: ProductDto;
  onJump: (product: ProductDto) => void;
  hidden: boolean;
}) {
  return (
    <button
      type="button"
      dir="rtl"
      tabIndex={hidden ? -1 : 0}
      onClick={() => onJump(product)}
      className={CHIP_CLASS}
    >
      <Thumb product={product} />
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
  );
}

export function DishTicker({ items, onJump }: Props) {
  // Duplicate short lists so the marquee never runs out of content.
  const sequence = useMemo(() => {
    if (items.length === 0) return [];
    let list = items;
    while (list.length < 8) list = [...list, ...items];
    return list;
  }, [items]);
  if (sequence.length === 0) return null;
  return (
    <div
      role="group"
      aria-label={strings.public.tickerAria}
      data-testid="hero-ticker"
      className="ticker border-t border-line bg-background/70 backdrop-blur-md select-none"
    >
      <div className="flex w-full overflow-hidden" dir="ltr">
        <div className="ticker-track flex shrink-0 items-center gap-2.5 pe-2.5 py-2">
          {sequence.map((product, index) => (
            <TrackChip key={`t1-${product.id}-${index}`} product={product} onJump={onJump} hidden={false} />
          ))}
        </div>
        <div aria-hidden="true" className="ticker-track flex shrink-0 items-center gap-2.5 pe-2.5 py-2">
          {sequence.map((product, index) => (
            <TrackChip key={`t2-${product.id}-${index}`} product={product} onJump={onJump} hidden={true} />
          ))}
        </div>
      </div>
    </div>
  );
}