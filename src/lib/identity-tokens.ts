/**
 * Single «پاتوق» identity tokens — exact docs/05 table (ADR-12).
 * M7 contrast pass: `--muted-2` lightened and `--accent` darkened so every
 * text/on-color pair is ≥ 4.5:1.
 */
export const IDENTITY = {
  background: "#0D0A07",
  foreground: "#F5EBDD",
  card: "#16110B",
  card2: "#1F1811",
  cardForeground: "#F5EBDD",
  muted: "#221A11",
  mutedForeground: "#A8947F",
  muted2: "#968064",
  border: "#2C2115",
  primary: "#E8A33D",
  primaryForeground: "#1A0F04",
  accent: "#A86218",
  accentForeground: "#FFFFFF",
  spark: "#F0563A",
  sparkForeground: "#240A04",
  badges: {
    POPULAR: { bg: "#E8A33D", fg: "#1A0F04" },
    NEW: { bg: "#7FD1A8", fg: "#0E1F15" },
    SPICY: { bg: "#F0563A", fg: "#240A04" },
    VEGETARIAN: { bg: "#4EAB72", fg: "#0E1F15" },
  },
  chapterHues: {
    caramel: "#C89B54",
    ice: "#8FB8CC",
    berry: "#C77DBB",
    tomato: "#D96C4A",
    flame: "#E8763D",
    mint: "#7FC8A9",
  },
} as const;

/** Text / fill pairs that must meet WCAG AA 4.5:1. */
export const TEXT_ON_COLOR_PAIRS: ReadonlyArray<{
  name: string;
  fg: string;
  bg: string;
}> = [
  { name: "foreground / background", fg: IDENTITY.foreground, bg: IDENTITY.background },
  { name: "card-foreground / card", fg: IDENTITY.cardForeground, bg: IDENTITY.card },
  { name: "card-foreground / card-2", fg: IDENTITY.cardForeground, bg: IDENTITY.card2 },
  { name: "muted-foreground / background", fg: IDENTITY.mutedForeground, bg: IDENTITY.background },
  { name: "muted-foreground / card", fg: IDENTITY.mutedForeground, bg: IDENTITY.card },
  { name: "muted-foreground / muted", fg: IDENTITY.mutedForeground, bg: IDENTITY.muted },
  { name: "muted-2 / background", fg: IDENTITY.muted2, bg: IDENTITY.background },
  { name: "muted-2 / card", fg: IDENTITY.muted2, bg: IDENTITY.card },
  { name: "muted-2 / card-2", fg: IDENTITY.muted2, bg: IDENTITY.card2 },
  { name: "primary-foreground / primary", fg: IDENTITY.primaryForeground, bg: IDENTITY.primary },
  { name: "accent-foreground / accent", fg: IDENTITY.accentForeground, bg: IDENTITY.accent },
  { name: "spark-foreground / spark", fg: IDENTITY.sparkForeground, bg: IDENTITY.spark },
  { name: "badge POPULAR", fg: IDENTITY.badges.POPULAR.fg, bg: IDENTITY.badges.POPULAR.bg },
  { name: "badge NEW", fg: IDENTITY.badges.NEW.fg, bg: IDENTITY.badges.NEW.bg },
  { name: "badge SPICY", fg: IDENTITY.badges.SPICY.fg, bg: IDENTITY.badges.SPICY.bg },
  { name: "badge VEGETARIAN", fg: IDENTITY.badges.VEGETARIAN.fg, bg: IDENTITY.badges.VEGETARIAN.bg },
];
