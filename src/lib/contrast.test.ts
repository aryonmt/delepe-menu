import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { IDENTITY, TEXT_ON_COLOR_PAIRS } from "./identity-tokens";

describe("docs/05 text-on-color pairs", () => {
  it.each(TEXT_ON_COLOR_PAIRS)("$name is at least 4.5:1", ({ fg, bg }) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("docs/05 chapter hues (informational, ≥ 3:1)", () => {
  const hues = Object.entries(IDENTITY.chapterHues);
  it.each(hues)("%s vs background is at least 3:1", (_name, hex) => {
    expect(contrastRatio(hex, IDENTITY.background)).toBeGreaterThanOrEqual(3);
  });

  it.each(hues)("%s vs card is at least 3:1", (_name, hex) => {
    expect(contrastRatio(hex, IDENTITY.card)).toBeGreaterThanOrEqual(3);
  });

  it("keeps tomato and flame as distinct hex values", () => {
    expect(IDENTITY.chapterHues.tomato).not.toBe(IDENTITY.chapterHues.flame);
  });
});
