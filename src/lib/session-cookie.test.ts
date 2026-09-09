import { describe, expect, it } from "vitest";
import { isHttpsForwardedProto } from "./session-cookie";

describe("isHttpsForwardedProto", () => {
  it("is true when Caddy sends https", () => {
    expect(isHttpsForwardedProto("https")).toBe(true);
  });

  it("is true for a comma list that starts with https", () => {
    expect(isHttpsForwardedProto("https,http")).toBe(true);
  });

  it("is false for HTTP IP deploy (no TLS)", () => {
    expect(isHttpsForwardedProto("http")).toBe(false);
    expect(isHttpsForwardedProto(null)).toBe(false);
    expect(isHttpsForwardedProto("")).toBe(false);
  });
});
