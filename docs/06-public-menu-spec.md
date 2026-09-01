# 06 · Public Menu Specification

Route: `/` (group `(public)`). Data: `GetPublicMenuUseCase` → `PublicMenuDto`
{ settings, categories: tree with products+variants+media URLs }.
All components in `components/menu/` are **pure/presentational** (reused by the
admin live preview, doc 07).

## Page structure (top → bottom)

1. **Hero header** — restaurant name (settings), display font, brand frame motif,
   animated background: two slow-drifting radial glows (transform only, 12s loop)
   + ornament draw-in on load. Height ≈ 200px; shrinks to 120px on scroll
   (scroll-linked scale/opacity).
2. **Sticky category tabs** (top-0, z-40, blur bg).
3. **Sub-category chips** (conditional).
4. **Sections**: one per top-level category, in sortOrder.
   - If the category has children and active chip = «همه»: render child groups
     with sub-headers, each listing its products.
   - If a child chip is active: render only that child's products (animated relayout).
5. **Footer mini** — «دلِپ · منوی دیجیتال» ornament only (no contact/social).

## Behaviors

| B-01 Tabs & scrollspy | Click → smooth scroll to section (auto when reduced-motion).
Scrollspy via IntersectionObserver (`rootMargin: -40% 0px -55%`); active tab
indicator springs; tab list auto-scrolls active tab into view. |
| B-02 Chips | Filter within active top category; AnimatePresence `popLayout`,
cards animate position/opacity; «همه» default. |
| B-03 Product card | Per doc 05. Tap → press scale only (no navigation; no detail page). |
| B-04 Variants | If variants exist: price line shows `از …` (BR-06) + chevron.
Expand → animated height list of `name … price` rows; multiple cards may be open;
state is local to the card. |
| B-05 Discount | Effective price primary + original struck + percent chip
(`−{round((1-disc/price)*100)}٪`). |
| B-06 Badges | Chips per doc 05 map, max 2 shown (+n). |
| B-07 Unavailable | Mode from settings: `HIDE` → excluded server-side;
`MUTED` → grayscale card + «ناموجود» chip; variants of muted product not expandable. |
| B-08 Empty rules | Category with 0 visible products hidden entirely.
No categories at all → global empty state. |
| B-09 Images | `next/image`, 4:3, sizes `(max-w: 768px) 104px, 140px`; first 4
`priority`; others lazy; placeholder = dominant-color bg + shimmer; error → ornament fallback. |
| B-10 Desktop | Content column `max-w-2xl` centered; at `md+` cards become a
2-column grid within sections (same card component). |

## Animation catalog (rich but smooth)

| # | Moment | Animation |
| --- | --- | --- |
| A-01 | First paint | Hero frame lines draw (scaleX), name fade-up, tabs slide-up, first-viewport cards stagger reveal (y16→0, 40ms) |
| A-02 | Scroll | Cards reveal once on enter viewport (whileInView, once) |
| A-03 | Tab change | Indicator spring (layoutId); section scroll |
| A-04 | Chip change | popLayout relayout + fade |
| A-05 | Variants expand | height + opacity spring; chevron rotate |
| A-06 | Press | scale .98 120ms |
| A-07 | Hero scroll | scale/opacity shrink linked to scroll |
| A-08 | Theme change (preview) | 300ms color cross-fade |

Reduced motion: all disabled (Framer `useReducedMotion` + CSS media).

## States

- **Loading**: RSC streams; Suspense fallback = hero skeleton + 3 card skeletons.
- **Error**: `error.tsx` → Persian friendly + «تلاش دوباره».
- **404**: branded not-found with ornament + link to `/`.
- **Stale data**: admin mutations revalidate tag; customers always see fresh menu.

## Acceptance criteria (E2E highlights)

1. Load `/` → hero, tabs, ≥1 section visible; Lighthouse performance ≥ 90 on mid-tier mobile profile.
2. Tap tab «غذای اصلی» → scrolls; scrollspy activates tab while scrolling to پیتزا.
3. Pizza card shows «از ۵۵۰ هزار تومان»; expand shows سایز کوچک/بزرگ prices.
4. Discounted cookie shows struck price + percent chip.
5. With `MUTED`, آب کرفس visible grayscale + «ناموجود»; switch settings to `HIDE` → gone.