# 06 · Public Menu Specification

Route: `/` (group `(public)`). Data: `GetPublicMenuUseCase` → `PublicMenuDto`
(settings + category tree with products/variants/media, BR-08 already applied by
the `toPublicMenu` mapper).
All components in `components/menu/` are **pure/presentational** (reused by the
admin live preview, doc 07).

## Feature Specification

- **Goal**: a premium, fast, animated mobile-first menu that customers open via QR.
- **User value**: read the full menu in seconds, see real prices/availability,
  enjoy a native-app feel on a mid-range Android over 4G.
- **Technical requirements**: RSC + tagged cache (doc 03); client JS limited to the
  interactive islands listed below; all visuals per doc 05; media per doc 03
  pipeline (`MenuImage` + custom loader).
- **Dependencies**: docs 03 (architecture, media), 04 (DTOs, BR-05..08, 13),
  05 (tokens, motion, component specs).
- **Implementation notes**: build presentational components first (Storybook-free;
  verify via the page itself), then wire scrollspy/chips islands.
- **Acceptance criteria**: see the E2E table at the end — each row is automatable.
- **Required tests**: unit (mapper, price formatting — doc 04) + E2E
  `public-menu.spec` + `a11y.spec` (doc 09).

## Page structure (top → bottom)

1. **Hero header** — per doc 05 (200px → 120px at `scrollY > 80`, display font,
   frame motif, two drifting radial glows 12s loop, ornament draw-in).
2. **Sticky category tabs** (top-0, z-40, blur bg).
3. **Sub-category chips** (only when the active category has children).
4. **Sections**: one per top-level category, in sortOrder.
   - Category **without** children: its products listed directly.
   - Category **with** children and active chip = «همه»: child groups with
     sub-headers (doc 05), each listing its products.
   - A child chip active: only that child's products (animated relayout).
5. **Footer mini** — «دلِپ · منوی دیجیتال» ornament only (no contact/social).

## Behaviors

| ID | Behavior |
| --- | --- |
| B-01 Tabs & scrollspy | Click → smooth scroll to section (`behavior: "auto"` when reduced-motion). Scrollspy via IntersectionObserver (`rootMargin: "-40% 0px -55%"`); active tab indicator springs (`layoutId`); tab list auto-scrolls active tab into view. |
| B-02 Chips | Filter within active top category; AnimatePresence `popLayout`, cards animate position/opacity; «همه» default. |
| B-03 Product card | Per doc 05. Tap → press scale only (no navigation; no detail page). |
| B-04 Variants | If variants exist: price line shows «از …» (BR-06) + chevron. Expand → animated height list of `name … price` rows; multiple cards may be open; state is local to the card. |
| B-05 Discount | Only on products without variants (BR-14). Effective price primary + original struck + percent chip (`−{round((1-disc/price)*100)}٪`). |
| B-06 Badges | Chips per doc 05 map, max 2 shown (+n overflow chip). |
| B-07 Unavailable | Mode from settings: `HIDE` → excluded server-side by the mapper; `MUTED` → grayscale card + «ناموجود» chip; variants of a muted product are not expandable. |
| B-08 Empty rules | Category with 0 visible products hidden entirely (mapper). No categories at all → global empty state (doc 05). |
| B-09 Images | `MenuImage` (next/image + media loader, doc 03), 4:3, sizes `(max-width: 768px) 104px, 140px`; first 4 images `priority`; others lazy; placeholder = `media.dominantColor` bg + shimmer; on error → ornament fallback. |
| B-10 Desktop | Content column `max-w-2xl` centered; at `md+` cards become a 2-column grid within sections (same card component, 140×105 image). |

## Client islands (exhaustive — everything else is RSC)

1. Hero scroll shrink (scroll listener, transform only)
2. Tabs + scrollspy + chip filter (one island per section list is fine)
3. Variant expander (per card)
4. `MenuImage` (client boundary allowed for loader; may be server-rendered with
   loader prop — pick the simpler correct option)

## Animation catalog (rich but smooth)

| # | Moment | Animation |
| --- | --- | --- |
| A-01 | First paint | Hero frame lines draw (scaleX), name fade-up, tabs slide-up, first-viewport cards stagger reveal (y16→0, 40ms) |
| A-02 | Scroll | Cards reveal once on enter viewport (whileInView, once) |
| A-03 | Tab change | Indicator spring (layoutId); section scroll |
| A-04 | Chip change | popLayout relayout + fade |
| A-05 | Variants expand | height + opacity spring; chevron rotate |
| A-06 | Press | scale .98 120ms |
| A-07 | Hero scroll | scale/opacity shrink linked to scroll (threshold 80px) |
| A-08 | Theme change (preview) | 300ms color cross-fade |

Reduced motion: all disabled (Motion `useReducedMotion` + CSS media query).

## States

- **Loading**: RSC streams; Suspense fallback = hero skeleton + 3 card skeletons.
- **Error**: `error.tsx` → Persian friendly + «تلاش دوباره».
- **404**: branded not-found with ornament + link to `/`.
- **Stale data**: admin mutations revalidate the `public-menu` tag; customers
  always see a fresh menu.

## Acceptance criteria (E2E highlights — automatable)

1. Load `/` → hero, tabs, ≥1 section visible; Lighthouse performance ≥ 90 on
   mid-tier mobile profile.
2. Tap tab «غذای اصلی» → page scrolls; scrollspy activates the tab while
   scrolling toward the پیتزا group.
3. The **پیتزا مارگاریتا** card shows «از ۵۵۰ هزار تومان»; expanding it lists
   «سایز کوچک ۵۵۰ هزار تومان» and «سایز بزرگ ۷۵۰ هزار تومان».
4. The discounted «کوکی متوسط» shows ۹۵ هزار تومان primary, ۱۱۵ هزار struck,
   and a −۱۷٪ chip.
5. With `MUTED`, «آب کرفس» is visible grayscale + «ناموجود»; switch settings to
   `HIDE` → it disappears from `/`.
6. A product assigned to a leaf category renders; the schema/UI make it
   impossible to assign one to a non-leaf category (BR-15).
