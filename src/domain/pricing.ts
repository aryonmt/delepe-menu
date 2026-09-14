/**
 * BR-05: the price a customer pays for one priced unit (product or variant).
 */
export function effectivePrice(input: {
  price: number;
  discountedPrice: number | null;
  discountActive: boolean;
}): number {
  if (
    input.discountActive &&
    input.discountedPrice !== null &&
    input.discountedPrice < input.price
  ) {
    return input.discountedPrice;
  }
  return input.price;
}

export type PricedUnit = {
  price: number;
  discountedPrice: number | null;
  discountActive: boolean;
};

/** Cheapest effective unit among base + variants (not shown as «از » on public cards). */
export function startingPrice(product: PricedUnit & { variants: PricedUnit[] }): number {
  return Math.min(effectivePrice(product), ...product.variants.map(effectivePrice));
}

export function discountPercent(price: number, discountedPrice: number): number {
  return Math.round((1 - discountedPrice / price) * 100);
}

/**
 * Admin input helper: store BR-04's discountedPrice from a whole-number percent off.
 * Returns null when the percent cannot produce a strictly lower toman amount.
 */
export function discountedPriceFromPercent(
  price: number,
  percent: number,
): number | null {
  if (!Number.isInteger(percent) || percent <= 0 || percent >= 100) {
    return null;
  }
  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }
  return Math.round(price * (1 - percent / 100));
}
