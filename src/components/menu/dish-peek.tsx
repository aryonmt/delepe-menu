"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ProductDto } from "@/application/dtos";
import { formatPrice } from "@/lib/format/price";
import { toPersianDigits } from "@/lib/format/digits";
import { strings } from "@/lib/fa/strings";
import { Badge } from "./badge";
import { MenuImage } from "./menu-image";

type Props = {
  product: ProductDto | null;
  onClose: () => void;
};

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

/**
 * Dish Peek — exploration/viewer only (docs/06 B-05).
 * No cart, tray, ordering, or checkout semantics.
 */
export function DishPeek({ product, onClose }: Props) {
  const hasVariants = (product?.variants.length ?? 0) > 0;
  const isMuted = product ? !product.isAvailable : false;
  const discount = product ? discountView(product) : null;

  return (
    <Dialog.Root
      open={product !== null}
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="peek-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          data-testid="dish-peek"
          className="peek-sheet fixed inset-x-0 bottom-0 z-50 max-h-[86svh] overflow-y-auto rounded-t-drawer border-t border-line bg-card p-5 shadow-lift focus:outline-none md:inset-0 md:m-auto md:h-fit md:max-h-[80vh] md:w-full md:max-w-md md:rounded-card md:border"
        >
          {product && (
            <>
              <div className="mb-4 flex items-start justify-between gap-3">
                <Dialog.Title asChild>
                  <h2 className="font-display text-2xl leading-tight text-foreground">
                    {product.name}
                  </h2>
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    data-testid="peek-close"
                    aria-label={strings.public.closePeek}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-card-2 text-muted-foreground transition-colors duration-fast hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">
                {strings.public.peekAria}
              </Dialog.Description>

              <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-image">
                <MenuImage
                  media={product.media}
                  alt={product.name}
                  fill
                  sizes="960px"
                  muted={isMuted}
                  objectPosition="50% 40%"
                />
                {isMuted && (
                  <span
                    className="absolute bottom-3 start-3 inline-block -rotate-6 rounded-stamp px-2.5 py-1 text-[12px] font-extrabold shadow-stamp"
                    style={{
                      background: "var(--destructive)",
                      color: "var(--destructive-foreground)",
                    }}
                  >
                    {strings.public.unavailable}
                  </span>
                )}
              </div>

              {product.badges.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {product.badges.map((kind) => (
                    <Badge key={kind} kind={kind} />
                  ))}
                </div>
              )}

              {product.description && (
                <p className="mb-4 text-body leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              {hasVariants ? (
                <div className="border-t border-line pt-3">
                  <p className="mb-2 text-secondary text-muted-foreground">
                    {strings.public.fromPrice}{" "}
                    <span className="font-display text-primary">{formatPrice(product.price)}</span>
                  </p>
                  <ul className="space-y-2">
                    {product.variants.map((variant) => (
                      <li key={variant.id} className="flex items-baseline justify-between gap-3">
                        <span className="text-body text-foreground/85">{variant.name}</span>
                        <span aria-hidden="true" className="flex-1 border-b border-dotted border-line/70" />
                        <span className="font-display text-[15px] text-primary">
                          {formatPrice(variant.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline gap-2 border-t border-line pt-3">
                  <span className="font-display text-[19px] text-primary">
                    {discount ? formatPrice(discount.effective) : formatPrice(product.price)}
                  </span>
                  {discount && (
                    <>
                      <span className="text-secondary text-muted-2 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span
                        className="-rotate-3 rounded-stamp px-1.5 py-0.5 text-[10px] font-extrabold shadow-stamp"
                        style={{
                          background: "var(--destructive)",
                          color: "var(--destructive-foreground)",
                        }}
                      >
                        −{toPersianDigits(discount.percent)}
                        {strings.public.percentSign}
                      </span>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}