import { formatPrice } from "@/lib/format/price";
import { toPersianDigits } from "@/lib/format/digits";
import { strings } from "@/lib/fa/strings";
import { discountPercent, effectivePrice } from "@/domain/pricing";

type Unit = {
  price: number;
  discountedPrice: number | null;
  discountActive: boolean;
};

export function unitDiscount(unit: Unit) {
  const effective = effectivePrice(unit);
  if (effective >= unit.price) return null;
  return { effective, percent: discountPercent(unit.price, effective) };
}

export function PricedAmount({
  unit,
  size = "card",
}: {
  unit: Unit;
  size?: "card" | "peek" | "row";
}) {
  const discount = unitDiscount(unit);
  const display = formatPrice(discount ? discount.effective : unit.price);
  const priceClass =
    size === "peek"
      ? "font-display text-[19px] text-primary"
      : size === "row"
        ? "font-display text-[15px] text-primary"
        : "font-display text-[17px] text-primary";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      <span className={priceClass} data-testid={size === "row" ? undefined : "price"}>
        {display}
      </span>
      {discount ? (
        <>
          <span className="text-secondary text-muted-2 line-through" data-testid="price-original">
            {formatPrice(unit.price)}
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
      ) : null}
    </span>
  );
}
