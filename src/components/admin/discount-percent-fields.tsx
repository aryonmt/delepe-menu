"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { discountPercent, discountedPriceFromPercent } from "@/domain/pricing";
import { PRICE_MIN_TOMAN } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { formatPrice } from "@/lib/format/price";
import { parseDigitInput } from "./product-form-draft";

type Props = {
  id: string;
  percentLabel: string;
  priceHintLabel: string;
  price: unknown;
  discountedPrice: number | null | undefined;
  error?: string;
  onDiscountedPriceChange: (value: number | null) => void;
};

function initialPercentText(
  price: unknown,
  discountedPrice: number | null | undefined,
): string {
  if (typeof price !== "number" || price <= 0 || discountedPrice == null) {
    return "";
  }
  return String(discountPercent(price, discountedPrice));
}

function derivedAmount(price: unknown, percentText: string): number | null {
  const percent = parseDigitInput(percentText);
  if (typeof percent !== "number" || typeof price !== "number") return null;
  return discountedPriceFromPercent(price, percent);
}

function useDiscountPercentInput(
  price: unknown,
  discountedPrice: number | null | undefined,
  onDiscountedPriceChange: (value: number | null) => void,
) {
  const [percentText, setPercentText] = useState(() =>
    initialPercentText(price, discountedPrice),
  );
  const lastPriceRef = useRef(price);

  useEffect(() => {
    if (lastPriceRef.current === price) return;
    lastPriceRef.current = price;
    onDiscountedPriceChange(derivedAmount(price, percentText));
  }, [price, percentText, onDiscountedPriceChange]);

  const hintAmount =
    typeof discountedPrice === "number" && discountedPrice >= PRICE_MIN_TOMAN
      ? discountedPrice
      : null;

  return {
    percentText,
    hintAmount,
    onPercentChange: (next: string) => {
      setPercentText(next);
      onDiscountedPriceChange(derivedAmount(price, next));
    },
  };
}

export function DiscountPercentFields({
  id,
  percentLabel,
  priceHintLabel,
  price,
  discountedPrice,
  error,
  onDiscountedPriceChange,
}: Props) {
  const { percentText, hintAmount, onPercentChange } = useDiscountPercentInput(
    price,
    discountedPrice,
    onDiscountedPriceChange,
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{percentLabel}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={percentText}
          onChange={(event) => onPercentChange(event.target.value)}
        />
        <span className="text-sm text-muted-foreground">
          {strings.public.percentSign}
        </span>
      </div>
      {hintAmount !== null && (
        <p className="text-xs text-muted-foreground">
          {priceHintLabel}: {formatPrice(hintAmount)}
        </p>
      )}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
