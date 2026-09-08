# 06 · Public Menu Specification — «پاتوق»

Route: `/` (group `(public)`). Data: `GetPublicMenuUseCase` → `PublicMenuDto`
(BR-08 applied by the pure `toPublicMenu` mapper). All `components/menu/*`
components remain **pure/presentational** (reused by the admin live preview).

## Feature Specification

- **Goal**: a cinematic, appetite-first, mobile-first menu for a young hangout —
  browsing itself is the experience. No ordering of any kind.
- **User value**: see real prices/availability instantly, feel hungry, explore
  dishes tactilely (Dish Peek), reach any chapter in one thumb move.
- **Technical requirements**: RSC + tagged cache (doc 03); client JS limited to
  the islands below; visuals per doc 05; media per doc 03 pipeline.
- **Dependencies**: docs 03 (architecture/media), 04 (DTOs, BRs), 05 (tokens).
- **Acceptance criteria**: E2E table at the end.
- **Required tests**: existing unit suite unchanged + `public-menu.spec`
  (updated rows) + `a11y.spec`.

## Data-driven rules (binding)

1. Everything renders from `PublicMenuDto`: category names/count/order, product
   names/descriptions/prices/discounts/availability/badges/images/variants.
   **No product name, category name, count, or bestseller claim is hardcoded.**
2. Robustness: 0 categories → global empty state · 1 category → dock renders
   one tab · categories with 0 visible products pruned (BR-08) · 0..N POPULAR
   per chapter → all flagged products render as signature cards, uncapped ·
   variable child counts · `media: null` → placeholder art (doc 05).
3. Long content: standard card title `line-clamp-1`, signature title/desc
   clamp-2, dock tabs/ticker chips nowrap+ellipsis, peek/chapter titles wrap
   with no clamp.
4. The hero renders `settings.restaurantName`. The exact brand string
   «دِ‌لِ‌پِ» (doc 05) is the seed/meta default only.
5. Signature tier counts and ticker item counts are presentation concerns; the
   menu itself always renders fully from the DTO.

## Page structure

1. **Hero** — wordmark ignition + eyebrow + optional tagline slot (currently
   empty by design) + dish ticker; ambient glow/grain; no photography required;
   a future full-bleed photo slots behind the wordmark with a scrim, zero
   recomposition (documented migration path).
2. **Chapters** — one section per top-level category in `sortOrder`, each with
   chapter header (ghost number + title + hue tick) and products; child groups
   render with sub-headers when the active chip is «همه»; leftover products on
   a parent render under the «سایر» sub-header (existing rule).
3. **Footer mini** — three-spark divider + `strings.public.footer`.

Overlays (not in flow): **context strip** (sticky top), **dock/spine**
(bottom on mobile / top on `md+`), **Dish Peek** dialog.

## Behaviors

| ID | Behavior |
| --- | --- |
| B-01 Dock & scrollspy | Tap → **near-instant jump** (`scrollIntoView({behavior:"auto"})`) + 250ms settle choreography (opacity/y on the arriving chapter header). Observer-ignore window 600ms. Scrollspy IO `rootMargin:"-30% 0px -55%"`. Active tab indicator springs (`layoutId`); active tab scrolls into view within the dock. `role=tablist/tab` + arrow-key nav preserved (RTL-aware). |
| B-02 Chips | Filter within active chapter; `popLayout` relayout; «همه» default; strip shows chapter name + chips when children exist. |
| B-03 Signature tier | Per doc 05 «Signature tier — UI behavior vs content responsibility»: every POPULAR product becomes a signature card; no UI cap; the designation is Admin-owned content; the layout stays graceful for any POPULAR count (self-contained full-width blocks in normal flow). |
| B-04 Cards | Standard card per doc 05; tap → press scale + open Dish Peek (no navigation, no route). |
| B-05 Dish Peek | Radix dialog per doc 05; content = image (960), name, badges, full description, price/variants; Esc/backdrop/X close; focus trap + restore; strictly non-transactional. |
| B-06 Variants | «از …» summary (BR-06) + chevron → spring-height ticket list; local state per card; multiple may be open; disabled when MUTED. |
| B-07 Discount | BR-14 (no variants) + BR-04/05; ember price + struck original + −٪ stamp; formula `−{round((1−disc/price)·100)}٪`. |
| B-08 Badges | doc 05 map; max 2 + `+n`. |
| B-09 Unavailable | `HIDE` → excluded by the mapper. `MUTED` → grayscale + opacity .7 + «امروز تموم شد» stamp. Copy maps to the single `isAvailable` boolean; if richer availability semantics are ever added to the model, copy mapping must be extended in this doc first. |
| B-10 Ticker | Items = flattened available products in chapter order, limited to `TICKER_MAX_ITEMS = 16` — **presentation-only** (doc 05): the ticker chooses up to 16 items for display; it never affects menu contents. Unavailable items excluded from the ticker. CSS marquee 40s; paused on hover for fine pointers only (a tap must never freeze it) and static under reduced motion. Tap → instant jump to the card + 600ms ember highlight flash. |
| B-11 Hero | Wordmark ignition once (900ms); `h1` semantics; `data-testid="hero"`. **Binding:** doc 05 «Hero — high-priority visual experimentation area» applies — structural spec plus Phase 1 evaluation/iteration mandate. |
| B-12 Images | `MenuImage` + media loader (doc 03); tiered `sizes`: standard `(max-width:768px) 160px, 200px` · signature `(max-width:768px) 100vw, 640px` · peek `960px` fixed. First 4 images `priority`, rest lazy. `dominantColor` placeholder + shimmer; error → placeholder art. **No `<img>` may precede menu product images in DOM order** (`media.spec` extracts the first `img[alt]`). |
| B-13 Empty rules | Mapper prunes empties (BR-08); zero categories → global empty state. |
| B-14 Desktop | Column `max-w-2xl` centered; `md+`: standard cards in 2-column grid (asserted by E2E), signature cards span both columns, dock becomes top spine. |

## Client islands (exhaustive — everything else is RSC)

1. Hero (wordmark ignition + ticker)
2. Dock/spine + scrollspy + settle
3. Context strip + chip filter
4. Product cards (variant tickets + peek trigger) and `MenuImage`
5. Dish Peek dialog (Radix; `next/dynamic` is the sanctioned lever if the
   bundle budget needs it)

## Animation catalog

| # | Moment | Animation |
| --- | --- | --- |
| A-01 | Load | Wordmark ignition: clusters rise (spring), kasra ticks drop in staggered with glow pulse (total 900ms); eyebrow/ticker fade-up |
| A-02 | Ticker | Continuous 40s loop; pause on hover/focus/reduced-motion |
| A-03 | Chapter arrival | Ghost number + title settle (250ms); cards stagger reveal (y16→0, 35ms, once) |
| A-04 | Tab change | Indicator spring; instant jump; chapter settle |
| A-05 | Chip change | popLayout relayout + fade |
| A-06 | Variants | height+opacity spring; chevron rotate |
| A-07 | Press | stamps: translate+shadow collapse; cards: scale .97/.98 (120ms) |
| A-08 | Peek | sheet slide-up / panel scale-fade (Radix data-state), transform/opacity |
| A-09 | Deep-link flash | target card ember ring flash 600ms |

Reduced motion: all disabled (Motion hook + CSS media query); ticker static.

## States

- **Loading**: Suspense skeletons per doc 05 (no splash gate).
- **Error**: `error.tsx` identity restyle + «تلاش دوباره».
- **404**: identity restyle + home link.
- **No image**: placeholder art (doc 05).
- **Stale data**: mutations revalidate the `public-menu` tag.

## Performance

`content-visibility:auto` on below-fold chapters — **verify scrollspy against
CV-enabled sections in Phase 4** (fallback: CV on deep chapters only). All
doc-11 budgets apply (≤220KB first-load JS, Lighthouse ≥90 mid-range Android).

## Acceptance criteria (E2E — automatable)

1. Load `/` → hero (wordmark as `h1`), dock, ≥1 section; آب کرفس visible,
   grayscale, `data-available="false"`, stamp «امروز تموم شد», opacity `0.7`.
2. Tap «غذای اصلی» (dock) → instant jump; tab `data-active`; scrollspy keeps it
   active while scrolling toward the پیتزا group.
3. پیتزا مارگاریتا: «از ۵۵۰ هزار تومان»; expand → tickets «سایز کوچک ۵۵۰…» /
   «سایز بزرگ ۷۵۰…».
4. کوکی متوسط: ۹۵ هزار تومان primary, ۱۱۵ هزار struck, −۱۷٪ stamp.
5. MUTED → HIDE switch removes آب کرفس.
6. Leaf-category product renders (اسپرسو).
7. Chips (context strip) filter «غذای اصلی» to پیتزا.
8. Ticker visible; tapping a ticker chip reveals its product card.
9. Tapping a card opens `dish-peek` showing name + image; Esc closes; focus
   returns to the trigger.
10. Desktop (`md+`): sections use a 2-column product grid.

## Testid contract (protected)

`hero` · `category-tabs` · `tab-{name}` · `data-active` · `section-{name}` ·
`product-{name}` · `data-available` · `unavailable-chip` · `price` ·
`price-original` · `discount-chip` · `variant-toggle` · `variant-list` ·
`subcategory-chips` · `product-grid` · new: `dish-peek`, `peek-close`,
`hero-ticker`. Any rename requires updating the E2E specs in the same commit.

## Required string changes (`lib/fa/strings.ts`)

- `strings.brand.wordmark` = exact «دِ‌لِ‌پِ» constant (doc 05) — new key.
- `strings.public.unavailable` value → «امروز تموم شد» (key preserved).
- New keys: `public.closePeek`, `public.peekAria`, `public.tickerAria`,
  `public.dockAria`, `meta.description` reworded around the new identity.
- Remove: hardcoded hero tagline default (tagline slot, empty by default).