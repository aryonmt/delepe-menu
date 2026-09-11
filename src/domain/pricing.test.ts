import { describe, expect, it } from "vitest";
import { discountPercent, effectivePrice, startingPrice } from "./pricing";

describe("effectivePrice", () => {
  it("uses discountedPrice when discount is active (BR-05)", () => {
    expect(
      effectivePrice({
        price: 115_000,
        discountedPrice: 95_000,
        discountActive: true,
      }),
    ).toBe(95_000);
  });

  it("uses base price when discount is inactive (BR-05)", () => {
    expect(
      effectivePrice({
        price: 115_000,
        discountedPrice: 95_000,
        discountActive: false,
      }),
    ).toBe(115_000);
  });

  it("applies product discount even when variants exist (BR-14)", () => {
    expect(
      effectivePrice({
        price: 550_000,
        discountedPrice: 500_000,
        discountActive: true,
      }),
    ).toBe(500_000);
  });
});

describe("startingPrice", () => {
  it("is the cheapest effective unit among base and variants (BR-06)", () => {
    expect(
      startingPrice({
        price: 700_000,
        discountedPrice: 650_000,
        discountActive: true,
        variants: [
          { price: 550_000, discountedPrice: null, discountActive: false },
          { price: 750_000, discountedPrice: 500_000, discountActive: true },
        ],
      }),
    ).toBe(500_000);
  });
});

describe("discountPercent", () => {
  it("rounds the percent off for the −٪ stamp (docs/06 B-07)", () => {
    expect(discountPercent(115_000, 95_000)).toBe(17);
  });
});
