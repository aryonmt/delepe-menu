"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ProductDto } from "@/application/dtos";
import { strings } from "@/lib/fa/strings";
import { Badge } from "./badge";
import { MenuImage } from "./menu-image";
import { PricedAmount } from "./priced-amount";
import { VariantTickets } from "./variant-tickets";

type Props = {
  product: ProductDto | null;
  onClose: () => void;
  /** Phone-frame preview: portal into the viewport instead of document.body. */
  container?: HTMLElement | null;
};

/**
 * Dish Peek — exploration/viewer only (docs/06 B-05).
 * No cart, tray, ordering, or checkout semantics.
 */
export function DishPeek({ product, onClose, container }: Props) {
  const hasVariants = (product?.variants.length ?? 0) > 0;
  const isMuted = product ? !product.isAvailable : false;

  return (
    <Dialog.Root
      open={product !== null}
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal container={container ?? undefined}>
        <Dialog.Overlay
          className={`peek-overlay inset-0 z-50 bg-black/70 backdrop-blur-sm ${
            container ? "absolute" : "fixed"
          }`}
        />
        <Dialog.Content
          data-testid="dish-peek"
          className={`peek-sheet z-50 max-h-[86svh] overflow-y-auto rounded-t-drawer border-t border-line bg-card p-5 shadow-lift focus:outline-none md:h-fit md:max-h-[80vh] md:w-full md:max-w-md md:rounded-card md:border ${
            container
              ? "absolute inset-x-0 bottom-0 md:inset-2 md:m-0 md:max-w-none"
              : "fixed inset-x-0 bottom-0 md:inset-0 md:m-auto"
          }`}
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
                  <VariantTickets variants={product.variants} />
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline gap-2 border-t border-line pt-3">
                  <PricedAmount unit={product} size="peek" />
                </div>
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}