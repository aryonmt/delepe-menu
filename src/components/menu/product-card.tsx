"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ProductDto } from "@/application/dtos";
import { formatPrice, formatPriceFrom } from "@/lib/format/price";
import { toPersianDigits } from "@/lib/format/digits";
import { strings } from "@/lib/fa/strings";
import { Badge } from "./badge";
import { MenuImage } from "./menu-image";
import { VariantTickets } from "./variant-tickets";

type Props = {
  product: ProductDto;
  tier: "signature" | "standard";
  index?: number;
  priority?: boolean;
  onOpenPeek: (product: ProductDto) => void;
};

/**
 * Brand easing as a typed bezier tuple so Motion's `Transition` type accepts
 * it even when `reveal` is declared outside JSX (no contextual typing).
 */
const EASE_BRAND: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

function discountView(product: ProductDto) {
  if (product.variants.length > 0) return null;
  const discountedPrice = product.discountedPrice;
  if (
    !product.discountActive ||
    discountedPrice === null ||
    discountedPrice >= product.price
  ) {
    return null;
  }
  return {
    effective: discountedPrice,
    percent: Math.round((1 - discountedPrice / product.price) * 100),
  };
}

function MutedStamp() {
  return (
    <span
      className="absolute bottom-2 start-2 inline-block -rotate-6 rounded-stamp px-2.5 py-1 text-[11px] font-extrabold shadow-stamp"
      style={{
        background: "var(--destructive)",
        color: "var(--destructive-foreground)",
      }}
      data-testid="unavailable-chip"
    >
      {strings.public.unavailable}
    </span>
  );
}

export function ProductCard({
  product,
  tier,
  index = 0,
  priority = false,
  onOpenPeek,
}: Props) {
  const reduceMotion = useReducedMotion();
  const hasVariants = product.variants.length > 0;
  const isMuted = !product.isAvailable;
  const discount = discountView(product);

  const openPeek = () => onOpenPeek(product);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPeek();
    }
  };

  const badgesRow = product.badges.length > 0 && (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      {product.badges.slice(0, 2).map((kind) => (
        <Badge key={kind} kind={kind} />
      ))}
      {product.badges.length > 2 && (
        <span className="rounded-stamp border border-line bg-card-2 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
          +{toPersianDigits(product.badges.length - 2)}
        </span>
      )}
    </div>
  );

  const priceBlock = hasVariants ? (
    <VariantTickets
      variants={product.variants}
      minPriceLabel={formatPriceFrom(product.price)}
      disabled={isMuted}
    />
  ) : (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="font-display text-[17px] text-primary" data-testid="price">
        {discount ? formatPrice(discount.effective) : formatPrice(product.price)}
      </span>
      {discount && (
        <>
          <span
            className="text-secondary text-muted-2 line-through"
            data-testid="price-original"
          >
            {formatPrice(product.price)}
          </span>
          <span
            className="-rotate-3 rounded-stamp px-1.5 py-0.5 text-[10px] font-extrabold shadow-stamp"
            style={{
              background: "var(--destructive)",
              color: "var(--destructive-foreground)",
            }}
            data-testid="discount-chip"
          >
            −{toPersianDigits(discount.percent)}
            {strings.public.percentSign}
          </span>
        </>
      )}
    </div>
  );

  const reveal = {
    initial: reduceMotion ? (false as const) : { opacity: 0, y: 16 },
    whileInView: { opacity: isMuted ? 0.7 : 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: {
      duration: 0.35,
      delay: reduceMotion ? 0 : (index % 4) * 0.035,
      ease: EASE_BRAND,
    },
  };

  const sharedProps = {
    "data-testid": `product-${product.name}`,
    "data-available": product.isAvailable ? "true" : "false",
    role: "button",
    tabIndex: 0,
    "aria-label": product.name,
    onClick: openPeek,
    onKeyDown: handleKeyDown,
  };

  if (tier === "signature") {
    return (
      <motion.article
        {...sharedProps}
        {...reveal}
        whileTap={{ scale: 0.98 }}
        className="group relative w-full cursor-pointer overflow-hidden rounded-card bg-gradient-to-b from-card to-card-2 shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative h-44 w-full overflow-hidden md:h-56">
          <MenuImage
            media={product.media}
            alt={product.name}
            priority={priority}
            muted={isMuted}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            objectPosition="50% 40%"
          />
          {isMuted && <MutedStamp />}
        </div>
        <div className="flex flex-col gap-1.5 p-4">
          {badgesRow}
          <h3 className="line-clamp-2 text-[17px] font-extrabold leading-snug text-card-foreground">
            {product.name}
          </h3>
          {product.description && (
            <p className="line-clamp-2 text-secondary text-muted-foreground">
              {product.description}
            </p>
          )}
          <div className="mt-2">{priceBlock}</div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      {...sharedProps}
      {...reveal}
      whileTap={{ scale: 0.98 }}
      className="group relative flex cursor-pointer items-center gap-3 rounded-card border border-line bg-gradient-to-b from-card to-card-2 p-3 shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
        <div>
          {badgesRow}
          <h3 className="line-clamp-1 text-[16px] font-extrabold leading-snug text-card-foreground">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-secondary text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
        <div className="mt-2">{priceBlock}</div>
      </div>
      <div className="relative w-[42%] shrink-0 self-center">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-image">
          <MenuImage
            media={product.media}
            alt={product.name}
            priority={priority}
            muted={isMuted}
            fill
            sizes="(max-width: 768px) 160px, 200px"
          />
        </div>
        {isMuted && <MutedStamp />}
      </div>
    </motion.article>
  );
}