import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CSP_REPORT_ONLY,
  HEADER_FRAME_DENY,
  HEADER_HSTS,
  HEADER_NOSNIFF,
  HEADER_REFERRER,
} from "./security-headers";

describe("docs/10 security header constants", () => {
  it("ships the v1 report-only CSP", () => {
    expect(CSP_REPORT_ONLY).toContain("default-src 'self'");
    expect(CSP_REPORT_ONLY).toContain("script-src 'self' 'unsafe-inline'");
  });

  it("matches the documented nosniff, referrer, frame, and HSTS values", () => {
    expect(HEADER_NOSNIFF).toBe("nosniff");
    expect(HEADER_REFERRER).toBe("strict-origin-when-cross-origin");
    expect(HEADER_FRAME_DENY).toBe("DENY");
    expect(HEADER_HSTS).toBe("max-age=31536000; includeSubDomains");
  });

  it("repeats those values in the Caddyfile", () => {
    const caddy = readFileSync("Caddyfile", "utf8");
    expect(caddy).toContain(`X-Content-Type-Options ${HEADER_NOSNIFF}`);
    expect(caddy).toContain(`Referrer-Policy ${HEADER_REFERRER}`);
    expect(caddy).toContain(CSP_REPORT_ONLY);
    expect(caddy).toContain(`Strict-Transport-Security "${HEADER_HSTS}"`);
  });
});
