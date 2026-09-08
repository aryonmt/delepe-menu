import { Lalezar, Vazirmatn } from "next/font/google";

/**
 * Display face for the wordmark, chapter titles, and prices.
 * Replaces Markazi Text per ADR-07 (Phase 0). next/font downloads at build
 * time and self-hosts at runtime — no Google Fonts requests in the browser.
 */
export const lalezar = Lalezar({
  subsets: ["arabic", "latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

/**
 * Body fallback until licensed IRANSans woff2 files are placed in
 * `src/fonts/iransans/`. CSS prefers IRANSans first (see globals.css).
 */
export const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-vazir",
  display: "swap",
});