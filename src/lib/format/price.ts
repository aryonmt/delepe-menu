import { strings } from "@/lib/fa/strings";
import { toPersianDigits } from "./digits";

const MOMAYYEZ = "\u066B";

/**
 * Formats an integer toman amount with Persian digits (docs/04 golden table).
 * Precondition: 1_000 ≤ p ≤ 100_000_000 (BR-12).
 */
export function formatPrice(p: number): string {
  if (p >= 1_000_000) {
    return formatMillions(p);
  }
  return formatBelowMillion(p);
}

/** Variant-card prefix: «از » + formatted price (BR-06). */
export function formatPriceFrom(p: number): string {
  return `${strings.public.fromPrice} ${formatPrice(p)}`;
}

function formatBelowMillion(p: number): string {
  let thousands = Math.floor(p / 1000);
  const rem = p % 1000;
  // Integer tenths-of-a-toman-thousand: rem/1000 rounded to 2 decimals.
  const hundredths = Math.round(rem / 10);

  if (hundredths >= 100) {
    thousands += 1;
    if (thousands >= 1000) {
      return formatMillions(thousands * 1000);
    }
    return `${toPersianDigits(thousands)} هزار تومان`;
  }

  if (hundredths === 0) {
    return `${toPersianDigits(thousands)} هزار تومان`;
  }

  const trimmed = (hundredths / 100).toFixed(2).replace(/\.?0+$/, "");
  const dot = trimmed.indexOf(".");
  const fraction = dot === -1 ? "" : trimmed.slice(dot + 1);
  return `${toPersianDigits(thousands)}${MOMAYYEZ}${toPersianDigits(fraction)} هزار تومان`;
}

function formatMillions(p: number): string {
  let millions = Math.floor(p / 1_000_000);
  let thousandPart = Math.round((p % 1_000_000) / 1000);
  if (thousandPart === 1000) {
    millions += 1;
    thousandPart = 0;
  }
  if (thousandPart === 0) {
    return `${toPersianDigits(millions)} میلیون تومان`;
  }
  return `${toPersianDigits(millions)} میلیون و ${toPersianDigits(thousandPart)} هزار تومان`;
}
