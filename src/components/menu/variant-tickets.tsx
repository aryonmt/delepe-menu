import type { VariantDto } from "@/application/dtos";
import { PricedAmount } from "./priced-amount";
import { strings } from "@/lib/fa/strings";

type Props = {
  variants: VariantDto[];
};

export function VariantTickets({ variants }: Props) {
  return (
    <ul className="space-y-2" data-testid="variant-list">
      {variants.map((variant) => {
        const muted = variant.isAvailable === false;
        return (
          <li
            key={variant.id}
            className={`flex items-baseline justify-between gap-3 text-secondary ${
              muted ? "opacity-70" : ""
            }`}
            data-available={muted ? "false" : "true"}
          >
            <span className="flex min-w-0 items-baseline gap-2 text-foreground/85">
              <span>{variant.name}</span>
              {muted ? (
                <span
                  className="shrink-0 -rotate-6 rounded-stamp px-1.5 py-0.5 text-[10px] font-extrabold shadow-stamp"
                  style={{
                    background: "var(--destructive)",
                    color: "var(--destructive-foreground)",
                  }}
                  data-testid="unavailable-chip"
                >
                  {strings.public.unavailable}
                </span>
              ) : null}
            </span>
            <span aria-hidden="true" className="flex-1 border-b border-dotted border-line/70" />
            <span className="font-display text-[15px] text-primary">
              <PricedAmount unit={variant} size="row" />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
