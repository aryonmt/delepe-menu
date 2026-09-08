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

- Public page = RSC; client JS limited to the five islands listed in doc 06
  (hero wordmark + ticker, dock/spine + scrollspy + settle, context strip +
  chips, product cards with variant tickets + peek trigger and MenuImage,
  Dish Peek dialog).
- Admin-only heavy libs (`@dnd-kit`, `react-easy-crop`) dynamically imported
  (never in the public bundle; verified by bundle-analyzer in CI, doc 09).
  The Dish Peek dialog (`@radix-ui/react-dialog`) may be dynamically imported
  via `next/dynamic` if the bundle budget requires it.
- Images: pre-generated WebP 320/640/960 (doc 03), `MenuImage` with custom loader,
  tiered sizes (standard `(max-width: 768px) 160px, 200px` · signature
  `(max-width: 768px) 100vw, 640px` · peek `960px` fixed), first 4 priority,
  rest lazy, immutable cache; `dominantColor` placeholder (no layout shift).
- Fonts: 2 families (Lalezar display + Vazirmatn body until IRANSans lands),
  woff2, subset, `display=swap`, preloaded; size budget 300KB total.
- Animations: transform/opacity only; `content-visibility: auto` on below-fold
  chapters — **verify scrollspy against CV-enabled sections in Phase 4**
  (fallback: CV on deep chapters only); no `will-change` spam;
  IntersectionObserver passive.
- Caching: public HTML `s-maxage=60` + tag revalidate on mutations;
  `/media` immutable 1y; admin no-store.

## Accessibility (WCAG 2.1 AA practical subset)

- Contrast ≥ 4.5:1 for text in the single «پاتوق» identity — token pairs in
  doc 05 were selected for this; the M7 identity-QA pass re-verifies with a
  contrast tool.
- Tap targets ≥ 44px (dock 60px, ticker chips and sub-category chips 44px);
  visible `:focus-visible` ring (2px, `--ring`).
- Dock/spine tabs: `role=tablist/tab` + arrow-key navigation; chips = buttons
  with `aria-pressed`.
- Ticker: pauses on hover/focus; under reduced motion it becomes a static,
  still-tappable row.
- Dish Peek: Radix dialog focus trap + `aria-modal` + Esc + focus restore.
- Forms: labels associated; errors via `aria-describedby` + Persian text.
- Toasts: `aria-live=polite`; availability switch = labeled switch role.
- Images: `alt` = product name (auto, since the owner skips alt editing).
- `prefers-reduced-motion`: all animation disabled (CSS + Motion hook).
- axe-core E2E gate (doc 09).