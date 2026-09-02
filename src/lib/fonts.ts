import { Markazi_Text, Vazirmatn } from "next/font/google";

/**
 * Display face for hero and section titles. next/font downloads at build and
 * self-hosts at runtime (ADR-07 — no Google Fonts requests in the browser).
 */
export const markaziText = Markazi_Text({
  subsets: ["arabic", "latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

/**
 * Body fallback when licensed IRANSans woff2 files are absent from
 * `src/fonts/iransans/`. CSS prefers IRANSans first; the browser skips it
 * until those files are added (see that folder's README).
 */
export const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-vazir",
  display: "swap",
});
