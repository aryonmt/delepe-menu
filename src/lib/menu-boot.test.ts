import { describe, expect, it } from "vitest";
import { isMenuBootComplete } from "./menu-boot";

describe("isMenuBootComplete", () => {
  it("keeps the gate closed until the minimum hold elapses", () => {
    expect(
      isMenuBootComplete({ elapsedMs: 400, minMs: 900, maxMs: 4500, pending: 0 }),
    ).toBe(false);
  });

  it("opens when preloads finished after the minimum hold", () => {
    expect(
      isMenuBootComplete({ elapsedMs: 900, minMs: 900, maxMs: 4500, pending: 0 }),
    ).toBe(true);
  });

  it("stays closed while images are still pending (after min hold)", () => {
    expect(
      isMenuBootComplete({ elapsedMs: 1200, minMs: 900, maxMs: 4500, pending: 2 }),
    ).toBe(false);
  });

  it("opens at the max wait even if images are still pending", () => {
    expect(
      isMenuBootComplete({ elapsedMs: 4500, minMs: 900, maxMs: 4500, pending: 3 }),
    ).toBe(true);
  });
});
