import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { IDENTITY } from "./identity-tokens";

function readRepo(relative: string): string {
  return readFileSync(relative, "utf8");
}

describe("T-070 single-identity wiring", () => {
  it("does not set data-theme on the public or root layouts", () => {
    expect(readRepo("src/app/layout.tsx")).not.toMatch(/data-theme/);
    expect(readRepo("src/app/(public)/layout.tsx")).not.toMatch(/data-theme/);
  });

  it("keeps a single :root token set and no data-theme selectors in globals.css", () => {
    const css = readRepo("src/app/globals.css");
    expect(css).not.toMatch(/data-theme/);
    expect(css.match(/:root/g)).toHaveLength(1);
    expect(css).toMatch(new RegExp(`--background:\\s*${IDENTITY.background}`, "i"));
    expect(css).toMatch(new RegExp(`--muted-2:\\s*${IDENTITY.muted2}`, "i"));
    expect(css).toMatch(new RegExp(`--accent:\\s*${IDENTITY.accent}`, "i"));
    expect(css).toMatch(new RegExp(`--primary:\\s*${IDENTITY.primary}`, "i"));
  });
});
