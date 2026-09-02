import { describe, expect, it } from "vitest";
import { formatPrice, formatPriceFrom } from "./price";

/**
 * Golden table from docs/04. Production change that would fail these tests:
 * wrong rounding, missing carry at 1_999_500, ASCII digits, or Latin decimal point.
 */
const GOLDEN: ReadonlyArray<readonly [number, string]> = [
  [1000, "۱ هزار تومان"],
  [75000, "۷۵ هزار تومان"],
  [90000, "۹۰ هزار تومان"],
  [125500, "۱۲۵٫۵ هزار تومان"],
  [130000, "۱۳۰ هزار تومان"],
  [1250000, "۱ میلیون و ۲۵۰ هزار تومان"],
  [1360000, "۱ میلیون و ۳۶۰ هزار تومان"],
  [1000000, "۱ میلیون تومان"],
  [1999500, "۲ میلیون تومان"],
];

describe("formatPrice", () => {
  it.each(GOLDEN)("formats %s as the golden Persian string", (input, output) => {
    expect(formatPrice(input)).toBe(output);
  });

  it("uses the Persian momayyez U+066B for the fractional thousand", () => {
    expect(formatPrice(125500)).toContain("\u066B");
    expect(formatPrice(125500)).not.toContain(".");
  });
});

describe("formatPriceFrom", () => {
  it("prefixes the formatted price with از and a space", () => {
    expect(formatPriceFrom(550000)).toBe(`از ${formatPrice(550000)}`);
  });
});
