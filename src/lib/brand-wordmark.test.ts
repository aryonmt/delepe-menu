import { describe, expect, it } from "vitest";
import { strings } from "@/lib/fa/strings";
import { assertLockedWordmark, wordmarkClusters } from "./brand-wordmark";

describe("locked brand wordmark (docs/05)", () => {
  it("keeps the exact Unicode sequence", () => {
    expect(() => assertLockedWordmark()).not.toThrow();
    expect([...strings.brand.wordmark].map((c) => c.codePointAt(0))).toEqual([
      0x062f, 0x0650, 0x200c, 0x0644, 0x0650, 0x200c, 0x067e, 0x0650,
    ]);
  });

  it("splits into three ZWNJ clusters", () => {
    expect(wordmarkClusters()).toEqual(["دِ", "لِ", "پِ"]);
  });
});
