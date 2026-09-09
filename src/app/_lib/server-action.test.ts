import { describe, expect, it } from "vitest";
import { ipFromForwardedHeader } from "./server-action";

describe("ipFromForwardedHeader", () => {
  it("uses the last hop (Caddy appends the real peer)", () => {
    expect(ipFromForwardedHeader("9.9.9.9, 203.0.113.10")).toBe("203.0.113.10");
  });

  it("returns a single hop unchanged", () => {
    expect(ipFromForwardedHeader("203.0.113.10")).toBe("203.0.113.10");
  });

  it("returns null when the header is missing", () => {
    expect(ipFromForwardedHeader(null)).toBeNull();
    expect(ipFromForwardedHeader("  ")).toBeNull();
  });
});
