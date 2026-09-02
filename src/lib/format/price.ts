import { toPersianDigits } from "./digits";

const MOMAYYEZ = "\u066B";

/**
 * Formats an integer toman amount with Persian digits (docs/04 golden table).
 * Precondition: 1_000 ≤ p ≤ 100_000_000 (BR-12).
 */
export function formatPrice(p: number): string {
  const thousands = Math.floor(p / 1000);
  const rem = p % 1000;

  if (p >= 1_000_000) {
    return formatMillions(p);
  }

  if (rem === 0) {
    return `${toPersianDigits(thousands)} هزار تومان`;
  }

  const fraction = fractionDigits(rem);
  return `${toPersianDigits(thousands)}${MOMAYYEZ}${toPersianDigits(fraction)} هزار تومان`;
}

/** Variant-card prefix: «از » + formatted price (BR-06). */
export function formatPriceFrom(p: number): string {
  return `از ${formatPrice(p)}`;
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

/** `rem/1000` trimmed to at most 2 decimal places, without a leading zero. */
function fractionDigits(rem: number): string {
  const trimmed = (rem / 1000).toFixed(2).replace(/\.?0+$/, "");
  const dot = trimmed.indexOf(".");
  return dot === -1 ? "" : trimmed.slice(dot + 1);
}
