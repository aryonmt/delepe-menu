import { describe, expect, it } from "vitest";
import { effectivePrice } from "./pricing";

describe("effectivePrice", () => {
  it("uses discountedPrice when discount is active (BR-05)", () => {
    expect(
      effectivePrice({
        price: 115_000,
        discountedPrice: 95_000,
        discountActive: true,
        variantCount: 0,
      }),
    ).toBe(95_000);
  });

  it("uses base price when discount is inactive (BR-05)", () => {
    expect(
      effectivePrice({
        price: 115_000,
        discountedPrice: 95_000,
        discountActive: false,
        variantCount: 0,
      }),
    ).toBe(115_000);
  });

  it("never applies discount when variants exist (BR-05, BR-14)", () => {
    expect(
      effectivePrice({
        price: 550_000,
        discountedPrice: 100_000,
        discountActive: true,
        variantCount: 2,
      }),
    ).toBe(550_000);
  });
});
