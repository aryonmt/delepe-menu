import type { ProductDto } from "@/application/dtos";
import { Badge } from "./badge";
import { MenuImage } from "./menu-image";
import { formatPrice, formatPriceFrom } from "@/lib/format/price";
import { strings } from "@/lib/fa/strings";

type Props = {
  product: ProductDto;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: Props) {
  const hasVariants = product.variants.length > 0;
  const isMuted = !product.isAvailable;
  const hasDiscount = product.discountActive && product.discountedPrice !== null && product.discountedPrice < product.price;
  const displayPrice = hasVariants ? formatPriceFrom(product.price) : formatPrice(product.price);
  const discountedText = hasDiscount ? formatPrice(product.discountedPrice as number) : null;
  const percent = hasDiscount
    ? Math.round((1 - (product.discountedPrice as number) / product.price) * 100)
    : 0;

  const badgesToShow = product.badges.slice(0, 2);
  const overflowCount = product.badges.length - badgesToShow.length;

  return (
    <article
      data-testid={`product-${product.name}`}
      data-available={product.isAvailable ? "true" : "false"}
      className={`flex gap-3 rounded-card border border-border bg-card p-3 shadow-warm transition-all duration-150 active:scale-[0.98] md:gap-4 md:p-4 ${isMuted ? "opacity-70" : ""}`}
    >
      <div
        className={`relative h-[78px] w-[104px] shrink-0 overflow-hidden rounded-image md:h-[105px] md:w-[140px] ${isMuted ? "grayscale" : ""}`}
        style={{ opacity: isMuted ? 0.55 : 1 }}
      >
        <MenuImage media={product.media} alt={product.name} priority={priority} isMuted={isMuted} />
        {isMuted && (
          <span
            className="absolute inset-x-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-center text-[11px] font-medium text-white backdrop-blur"
            data-testid="unavailable-chip"
          >
            {strings.public.unavailable}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {(badgesToShow.length > 0 || overflowCount > 0) && (
          <div className="mb-1 flex flex-wrap items-center gap-1">
            {badgesToShow.map((kind) => (
              <Badge key={kind} kind={kind} />
            ))}
            {overflowCount > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">+{overflowCount}</span>
            )}
          </div>
        )}
        <h3 className="line-clamp-1 font-sans text-card-title text-card-foreground">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-secondary text-muted-foreground">{product.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <span className="font-sans text-price text-primary" data-testid="price">
            {hasDiscount && discountedText ? discountedText : displayPrice}
          </span>
          {hasDiscount && (
            <>
              <span className="text-secondary text-muted-foreground line-through">{formatPrice(product.price)}</span>
              <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-medium text-destructive-foreground">−{percent}٪</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
