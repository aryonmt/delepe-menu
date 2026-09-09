import { describe, expect, it } from "vitest";
import { isUnusableDatabase } from "./unusable-database";

describe("isUnusableDatabase", () => {
  it("treats missing-table and unreachable-server codes as unusable", () => {
    expect(isUnusableDatabase({ code: "P2021" })).toBe(true);
    expect(isUnusableDatabase({ code: "P1001" })).toBe(true);
  });

  it("does not swallow ordinary query failures", () => {
    expect(isUnusableDatabase({ code: "P2002" })).toBe(false);
    expect(isUnusableDatabase(new Error("boom"))).toBe(false);
  });
});
