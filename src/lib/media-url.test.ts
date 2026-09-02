import { describe, expect, it } from "vitest";
import { isValidMediaWidth, mediaUrl } from "./media-url";

describe("mediaUrl", () => {
  it("maps exact widths to /media/[id]?w=", () => {
    expect(mediaUrl("abc123", 320)).toBe("/media/abc123?w=320");
    expect(mediaUrl("abc123", 640)).toBe("/media/abc123?w=640");
    expect(mediaUrl("abc123", 960)).toBe("/media/abc123?w=960");
  });

  it("coerces intermediate widths to the nearest variant (≤320→320, ≤640→640, else 960)", () => {
    expect(mediaUrl("abc123", 100)).toBe("/media/abc123?w=320");
    expect(mediaUrl("abc123", 320)).toBe("/media/abc123?w=320");
    expect(mediaUrl("abc123", 400)).toBe("/media/abc123?w=640");
    expect(mediaUrl("abc123", 640)).toBe("/media/abc123?w=640");
    expect(mediaUrl("abc123", 800)).toBe("/media/abc123?w=960");
    expect(mediaUrl("abc123", 1200)).toBe("/media/abc123?w=960");
  });

  it("validates widths via isValidMediaWidth", () => {
    expect(isValidMediaWidth(320)).toBe(true);
    expect(isValidMediaWidth(640)).toBe(true);
    expect(isValidMediaWidth(960)).toBe(true);
    expect(isValidMediaWidth(500)).toBe(false);
    expect(isValidMediaWidth(0)).toBe(false);
  });
});
