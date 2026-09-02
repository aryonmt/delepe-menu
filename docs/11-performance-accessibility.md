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

- Public page = RSC; client JS limited to the four islands listed in doc 06
  (hero scroll, tabs/scrollspy/chips, variant expander, MenuImage).
- Admin-only heavy libs (`@dnd-kit`, `react-easy-crop`) dynamically imported
  (never in the public bundle; verified by bundle-analyzer in CI, doc 09).
- Images: pre-generated WebP 320/640/960 (doc 03), `MenuImage` with custom loader,
  sizes `(max-width: 768px) 104px, 140px`, first 4 priority, rest lazy,
  immutable cache; `dominantColor` placeholder (no layout shift).
- Fonts: 2 families, woff2, subset, `display=swap`, preloaded; size budget 300KB total.
- Animations: transform/opacity only; `content-visibility: auto` on below-fold
  sections; no `will-change` spam; IntersectionObserver passive.
- Caching: public HTML `s-maxage=60` + tag revalidate on mutations;
  `/media` immutable 1y; admin no-store.

## Accessibility (WCAG 2.1 AA practical subset)

- Contrast ≥ 4.5:1 for text in **all 4 themes** — token pairs in doc 05 were
  selected for this; the M7 design-QA pass re-verifies with a contrast tool.
- Tap targets ≥ 44px; visible `:focus-visible` ring (2px, `--ring`).
- Tabs: `role=tablist/tab` + arrow-key navigation; chips = buttons with `aria-pressed`.
- Dialogs/drawers: Radix focus trap + `aria-modal`; Esc closes.
- Forms: labels associated; errors via `aria-describedby` + Persian text.
- Toasts: `aria-live=polite`; availability switch = labeled switch role.
- Images: `alt` = product name (auto, since the owner skips alt editing).
- `prefers-reduced-motion`: all animation disabled (CSS + Motion hook).
- axe-core E2E gate (doc 09).
