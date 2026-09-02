/**
 * BR-05: the price a customer pays.
 * Variants are never discounted (BR-14); if variants exist, base `price` wins.
 */
export function effectivePrice(input: {
  price: number;
  discountedPrice: number | null;
  discountActive: boolean;
  variantCount: number;
}): number {
  if (input.variantCount > 0) {
    return input.price;
  }
  if (input.discountActive && input.discountedPrice !== null) {
    return input.discountedPrice;
  }
  return input.price;
}
