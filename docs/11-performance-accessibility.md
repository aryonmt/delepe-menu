# 11 · Performance & Accessibility

## Budgets (mid-range Android, 4G)

| Metric | Target |
| --- | --- |
| LCP | < 2.5s |
| TBT | < 200ms |
| CLS | < 0.1 |
| First-load JS (public) | ≤ 220KB gzipped |
| Lighthouse (mobile) | ≥ 90 all four categories |

## How budgets are met

- Public page = RSC; zero client JS except motion island + variants island.
- Admin-only heavy libs (`@dnd-kit`, `react-easy-crop`) dynamically imported
  (never in public bundle; verified by bundle-analyze in CI).
- Images: WebP 320/640/960, `next/image` sizes, first 4 priority, rest lazy,
  immutable cache; dominant-color placeholder (no layout shift).
- Fonts: 2 families, woff2, subset, `display=swap`, preloaded; size budget 300KB total.
- Animations: transform/opacity only; `content-visibility: auto` on below-fold sections;
  no `will-change` spam; IntersectionObserver passive.
- Caching: public HTML `s-maxage=60` + tag revalidate on mutations;
  `/media` immutable 1y; admin no-store.

## Accessibility (WCAG 2.1 AA practical subset)

- Contrast ≥ 4.5:1 for text in **all 4 themes** (verified in design QA).
- Tap targets ≥ 44px; visible `:focus-visible` ring (2px, `--ring`).
- Tabs: `role=tablist/tab` + arrow-key navigation; chips = buttons with `aria-pressed`.
- Dialogs/drawers: Radix focus trap + `aria-modal`; Esc closes.
- Forms: labels associated; errors via `aria-describedby` + Persian text.
- Toasts: `aria-live=polite`; availability switch = labeled switch role.
- Images: `alt` = product name (auto, since owner skips alt editing).
- `prefers-reduced-motion`: all animation disabled (CSS + Framer hook).
- axe-core E2E gate (doc 09).