# 05 · Design System — «پاتوق» Identity

## Brand direction

**«پاتوق — The Cinematic Hangout»**: a warm, dark, cinematic canvas where food
radiates off the screen. Neon-sign glow × street-poster energy. Young, energetic,
appetizing, warm, slightly rebellious, family-tolerant. Never fine-dining
pretentious; never childish.

**One identity.** The former 4-theme system is retired (ADR-12). The
`Settings.theme` field persists in the data model unchanged (default
`WARM_HONEY`, zero migration) but is **visually inert**; the public UI renders
only the «پاتوق» identity. The former `✦` star survives only as a minor
decorative divider.

## Design constants vs Admin-managed content (binding distinction)

| Design constants — owned by this doc | Admin-managed data — never hardcoded in layout logic |
| --- | --- |
| Tokens, wordmark treatment, radii, shadows, motion, spacing, tier rules ("POPULAR flag ⇒ signature card"), hue palette order, clamp limits | Restaurant name, category names/count/order, product names/descriptions, prices, discounts, availability, badges (incl. POPULAR), images, variants, subcategory counts |

Rules:

1. Components must tolerate **0..N** categories, children, products, variants,
   badges, and POPULAR items, and any reordering/renaming by the Admin.
2. The only brand strings in code are `strings.brand.wordmark` (seed/meta/wordmark
   default) and admin-provided `settings.restaurantName` rendered at runtime.
3. If a visual decision depends on a data assumption, the assumption must be
   written here or in doc 06 — never decided silently in code.

## Wordmark & brand marks

- Exact Persian brand string: **`دِ‌لِ‌پِ`** — Unicode sequence
  `U+062F U+0650 U+200C U+0644 U+0650 U+200C U+067E U+0650`.
  Defined once in `strings.brand.wordmark`; used by seed `restaurantName`,
  `strings.meta`, footer, and the hero wordmark default. **Never normalized or
  altered**; any typographic improvement is done in CSS/layout only.
- The hero renders `settings.restaurantName` (admin-managed). If the Admin
  renames the restaurant, the wordmark follows — the exact string above is the
  seed/default value only.
- Rendered in Lalezar. The **three kasra ticks are the secondary brand motif**
  ("three sparks"), colored `--primary`.
- Latin lockup: **DELEPE** in Lalezar Latin, `letter-spacing: .3em`
  (letter-spacing is permitted on Latin text only).
- Favicon: dark rounded square + three-spark ticks (replaces the star).

### Wordmark visual validation (binding)

- The source string is **locked**: `دِ‌لِ‌پِ`
  (`U+062F U+0650 U+200C U+0644 U+0650 U+200C U+067E U+0650`).
  **The rendering is NOT locked.** A locked string is not an assumed visual result.
- During Phase 1 the rendered wordmark in Lalezar must be visually validated on:
  desktop Chrome, mobile Chrome (Android), and iOS Safari — at both wordmark
  sizes (64px mobile / 88px `md+`).
- Validation checklist:
  1. Every kasra renders fully — no clipping from line-height or overflow.
  2. The ZWNJ separations render as clean gaps between the clusters دِ / لِ / پِ —
     no unintended joining, no doubled spacing.
  3. The three kasras read as the "three sparks" motif (visible, ember-tinted if
     technically possible — see below).
  4. Optical centering and baseline inside the hero composition.
- Permitted presentation-layer treatments (the string constant is never modified):
  - Per-cluster `<span>`s — safe, because the clusters are already ZWNJ-separated.
  - Diacritic tinting via separate mark spans **only if** shaping and mark
    positioning are verified unchanged on all target browsers; otherwise fall back
    to a single-color wordmark with the ember glow.
  - Line-height, padding, optical margin, and `text-rendering` tuning.
- If rendering is poor on any target browser: fix it in CSS/markup. If it cannot
  be fixed, escalate with screenshots. **Never normalize, re-type, or alter the
  source string.**

## Color tokens — «پاتوق» (single identity, dark)

All text/on-color pairs ≥ 4.5:1 (computed; M7 re-verifies with a contrast tool).
`--spark` is used as a *fill* (stamps/badges) — never as small body text.
M7 contrast pass: `--muted-2` was `#756350` (failed AA on card surfaces) and
`--accent` was `#B86E20` (failed AA with white ink). Corrected values are in
the table below; see `docs/15-m7-visual-qa.md`.

| Token | Value | Role |
| --- | --- | --- |
| `--background` | `#0D0A07` | charred-coffee canvas |
| `--foreground` | `#F5EBDD` | warm cream ink |
| `--card` | `#16110B` | card surface |
| `--card-2` | `#1F1811` | raised surface |
| `--card-foreground` | `#F5EBDD` | |
| `--muted` | `#221A11` | |
| `--muted-foreground` | `#A8947F` | secondary text |
| `--muted-2` | `#968064` | tertiary text |
| `--border` | `#2C2115` | |
| `--line` | `rgba(232,163,61,.16)` | hairlines |
| `--primary` | `#E8A33D` | **Ember** — the brand light source |
| `--primary-foreground` | `#1A0F04` | |
| `--accent` | `#A86218` | |
| `--accent-foreground` | `#FFFFFF` | |
| `--ring` | `#E8A33D` | focus rings |
| `--glow` | `rgba(232,163,61,.45)` | |
| `--spark` | `#F0563A` | **the rebellious accent** (alias: destructive) |
| `--spark-foreground` | `#240A04` | (alias: destructive-foreground) |
| `--ornament` | `#E8A33D` | decorative ✦ only |

Badges (bg / fg — poster style: bright fill, dark ink):

| badge | bg | fg |
| --- | --- | --- |
| POPULAR | `#E8A33D` | `#1A0F04` |
| NEW | `#7FD1A8` | `#0E1F15` |
| SPICY | `#F0563A` | `#240A04` |
| VEGETARIAN | `#4EAB72` | `#0E1F15` |

**Chapter hues** `--chapter-hue-1..6` — exactly **six** dark-adapted hues,
used sparingly (per Q17):

| # | name | value |
| --- | --- | --- |
| 1 | caramel | `#C89B54` |
| 2 | ice | `#8FB8CC` |
| 3 | berry | `#C77DBB` |
| 4 | tomato | `#D96C4A` |
| 5 | flame | `#E8763D` |
| 6 | mint | `#7FC8A9` |

Assignment rule (design constant): a top-level category's hue =
`hues[(displayIndex) mod 6]`, evaluated in render/sort order.

- Deterministic and data-driven — **never** mapped to category names.
- More than six categories cycle through the six hues deterministically.
- Reordering categories may change their assigned hue (accepted, documented).
- Hues are used only for chapter ghost numbers (decorative), active-chip
  accents, and placeholder fields — never as full surfaces and never as
  separate themes. Where a hue carries information it must hold ≥ 3:1
  against its backdrop.
- Note: `honey` and `cocoa` from the earlier draft were dropped to honor the
  approved six-hue decision. Tomato↔flame stay distinct (`#D96C4A` vs
  `#E8763D`); asserted in the M7 contrast suite.

Ambient layers: `--ambient-glow-1/-2` warm radial gradients on the canvas
(top-start ember, bottom-end spark tint) + `.grain-overlay` utility.

## Typography

- **Display: Lalezar** (OFL, `next/font/google`, subsets arabic+latin, weight
  400, variable `--font-display`). Replaces Markazi Text (ADR-07). Two
  families total (Lalezar + Vazirmatn-until-IRANSans) keeps the 300KB budget.
- **Body:** IRANSans (owner-supplied woff2) → fallback Vazirmatn
  (`--font-vazir`). Chain: `IRANSans, var(--font-vazir), sans-serif`.

| Use | Size / weight | Face |
| --- | --- | --- |
| Wordmark | 64px mobile / 88px `md+`, lh 1.15 | Lalezar |
| Ticker item | name 14px / price 12.5px | Lalezar / body |
| Chapter title | 30px mobile / 36px `md+` | Lalezar |
| Chapter ghost number | 88px, opacity .1 (decorative) | Lalezar |
| Sub-header | 18px | Lalezar |
| Peek title | 24px | Lalezar |
| Prices | 17px (cards) / 19px (signature) / 15px (variant tickets) | Lalezar |
| Card title | 16px / 800 | body |
| Body | 15px / lh 1.8 | body |
| Secondary | 12.5px / lh 1.7 | body |
| Badge / stamp | 11px / 800 | body |
| Dock label | 12.5px / 700 | body |

Persian rules (unchanged): ZWNJ everywhere, no letter-spacing on Persian text,
Persian digits, momayyez `U+066B`, Persian punctuation. The wordmark's kasras
are a brand-spelling exception owned by the string constant, not prose.

## Shape, shadow & texture

- Radii: `--radius` 14px (controls) · `--radius-card` 20px · `--radius-image`
  16px · `--radius-drawer` 24px (peek top corners on mobile) · `--radius-stamp`
  10px. Philosophy: **food frames are soft; meta is tight.**
- Shadows: `--shadow-card: 0 10px 28px -8px rgb(0 0 0 /.7)` ·
  `--shadow-lift: 0 18px 44px -8px rgb(0 0 0 /.85)` ·
  `--shadow-stamp: 3px 3px 0 0 rgb(0 0 0 /.55)` (hard offset — the
  street-poster device) · active-pill glow `0 0 18px var(--glow)`.
- **Press language:** stamp/pill controls translate 2px into their hard shadow
  and the shadow collapses to 1px (`whileTap`); cards scale `.98` (120ms).
- Stamp rotation: decorative stamps only, ±2° (discount chip −3°, unavailable
  stamp −6°). Functional controls are never rotated.
- **`.grain-overlay`:** inline-SVG `feTurbulence` data-URI, opacity .035,
  `pointer-events:none` — no asset request. Hero adds a radial vignette fading
  into `--background`.

## Motion tokens

| token | value |
| --- | --- |
| twin-orbit | 1000ms ease infinite (half-period delay on the second disc) |
| menu-boot min / max | 900ms hold / 4500ms fail-open |
| shimmer sweep | 1400ms ease-in-out infinite |
| ease-brand | cubic-bezier(.22,.61,.36,1) |
| spring | stiffness 380 · damping 32 |
| stagger | 35ms |
| reveal-y | 16px |
| settle (chapter arrival) | 250ms |
| press | 120ms · scale .97 |
| ticker loop | 40s linear |
| wordmark ignition | 900ms total |

Rules: transform/opacity only. **Sanctioned exceptions:** variant-ticket height
expansion and the peek dialog open/close (small, scoped). `prefers-reduced-motion`
disables everything: wordmark static, ticker paused as a static scrollable row,
jumps instant. Motion library: `motion/react` (ADR-09).

## Icons

lucide-react main package only. Badge icons unchanged: POPULAR `Flame`,
NEW `Sparkles`, SPICY `FlameKindling`, VEGETARIAN `Leaf`. Added: `X` (peek
close), `ChevronDown` (variants, mirrored in RTL). **No emoji anywhere in the
public UI** (E2E catalog SVG glyphs no longer use emoji — see ADR-10).

## RTL rules

`<html dir="rtl" lang="fa">`; logical utilities only (`ms/me/ps/pe/start/end`);
no physical left/right in components; directional icons mirrored via
`rtl:rotate-180`. Ticker: duplicated track loops seamlessly, drifting toward
inline-end (rightward in RTL); verified visually in Phase 4.
**Text fields.** `dir` follows the first letter or digit in the value: Latin
or any numeric digit (ASCII / Persian / Arabic-Indic) → `ltr`; Arabic/Persian
letters → `rtl`. Empty fields follow the page (`rtl`). Radios, checkboxes,
file inputs, and hidden fields are excluded.

## Component specs (visual)

**Hero.** Mobile `min-height: min(52svh, 420px)`; from `md` `min(72svh, 620px)`.
Wordmark centered; eyebrow chip (`strings.public.subtitle`) above it;
**optional tagline slot renders only when a non-empty string exists (currently
none — documented, not a bug)**; ticker anchored to the hero's bottom edge;
ambient glows + grain + vignette. `h1` = the rendered restaurant name.
`data-testid="hero"`.
**Hero solar stage.** Mobile layout height `200px`; from `md` `450px`. Inner 3D
disc `240px` on mobile, `940px` from `md`. Orbit CSS variables on `.solar-system`
(inner / mid / outer): desktop `175px` / `285px` / `395px`; ≤768px `100px` /
`165px` / `230px`; ≤480px `70px` / `115px` / `160px`.

**Dish ticker.** Chip = min-height 44px pill, border `--line`, bg `card/.7` +
blur; content: name (Lalezar 14) + «،» separator + price (12.5, ember).
Track duplicated once, duplicate `aria-hidden`. Chips are buttons.
`TICKER_MAX_ITEMS = 16` — a **design/UX presentation constant, not a content
limitation**. The ticker selects up to 16 eligible (available) items, taken in
chapter order, purely for the ticker presentation. The underlying menu may
contain any number of products; this constant never filters, hides, or alters
actual menu content and is never read by the menu rendering path.

**Menu nav header (all breakpoints).** One sticky top glass header replaces the
former bottom dock + separate strip: row 1 = category tabs (same tablist
semantics, glass capsule, ember pill indicator), row 2 = active chapter name +
subcategory chips (rendered only when the active chapter has children).
No fixed bottom navigation exists anymore; content bottom padding is normal.
`data-testid="category-tabs"`, tabs `tab-{name}` + `data-active`,
`data-testid="subcategory-chips"` preserved.
**Dish ticker.** Chip = min-height 44px pill, border `--line`, bg `card/.7` +
blur; content: 36px circular thumbnail (pre-generated WebP 320 rendered as a
decorative background-image span, `aria-hidden`, dominantColor fallback),
name (Lalezar 14), «،» separator, price (12.5, ember). Items come from
`settings.tickerProductIds` (admin-curated, available-only, capped at
`TICKER_MAX_ITEMS`); an empty list falls back to the first eligible items in
chapter order. Track duplicated once, duplicate `aria-hidden`.
**only when the active chapter has children**. Chips min-height 44px pill,
`aria-pressed`, `layoutId` fill. `data-testid="subcategory-chips"`.

**Chapter header.** pt 56 / pb 24 (mobile); ghost number (hue, opacity .1,
inline-end, absolute); title Lalezar 30/36; hue tick rule. Section
`scroll-mt` accounts for strip height only (dock is bottom).

**Signature card** (any product whose badges include POPULAR — 0..N per
chapter, no cap, no copy claims). Full-width; image 1:1,
`object-fit:cover; object-position: 50% 40%`; badges row, title
17/800 clamp-2, description clamp-2, price Lalezar 19. Tap → Dish Peek.

### Signature tier — UI behavior vs content responsibility

- **UI behavior:** every product whose `badges` include `POPULAR` renders in
  the signature tier. There is **no UI cap, no demotion logic, and no hidden
  limit**. A chapter with zero POPULAR products renders entirely as standard
  cards.
- **Content responsibility:** the POPULAR designation is Admin-managed
  content. The UI never assumes a specific count — not five, not any fixed
  number. The five POPULAR items in the E2E catalog fixture are sample data
  only and carry no design significance.
- **Gracefulness at scale:** signature cards are self-contained full-width
  blocks in normal document flow, so an unusually large number of POPULAR
  products degrades to a longer stack of signature cards — the layout remains
  correct, and the image payload is covered by the standard lazy-loading and
  variant-sizing rules (doc 06, B-12).
- A presentation cap may only ever be introduced as a documented product
  decision — never silently as a layout workaround.

**Standard card.** Horizontal; image 42% width, 1:1, rounded-image, **top-aligned**
(`items-start` / `self-start`) so a tall variant list does not recenter the photo;
title 16/800
clamp-1, description clamp-2, price row. `md+`: 2-column grid. Tap → Dish Peek.
Press: scale .98. Both tiers: `data-testid="product-{name}"`,
`data-available`, `price`, `price-original`, `discount-chip` preserved.

**Variant tickets.** Always visible list of ticket rows (no chevron, no collapse):
variant name + dotted leader + that variant’s price (Lalezar). MUTED variants get
the «امروز تموم شد» stamp on the row. Base price is not shown as «از …».

**Discount.** Ember effective price + struck muted original + rotated (−3°)
spark stamp chip `−{percent}٪` with `--shadow-stamp`. Formula unchanged.

**Unavailable (MUTED).** Image grayscale + opacity .55; **card opacity .7
(fixed — asserted by E2E)**; diagonal −6° stamp on the image corner:
«امروز تموم شد» (bg `--spark`, fg `--spark-foreground`, shadow-stamp).
`data-testid="unavailable-chip"` on the stamp. Variants not expandable.

**Badges.** Above the title, max 2 + `+n` overflow chip.

**Dish Peek.** Radix Dialog. Mobile: bottom sheet (slide-up, rounded-t-drawer,
max-height 86svh, inner scroll). `md+`: centered panel max-w-md, rounded-card.
Content: image (1:1, full width, 960 variant; placeholder art when media is
null), title (Lalezar 24, wraps, no clamp), badges, full description, price
block or full variant-ticket list (read-only), unavailable stamp when muted.
Close: X button, Esc, backdrop. Focus trap + `aria-modal` + focus restore
(Radix). **Zero transactional affordances** — no cart/order/tray semantics,
no buttons that imply purchase. `data-testid="dish-peek"`, close `peek-close`.
MUTED products may still be peeked (read-only exploration).

**Placeholder art** (product with `media: null`, deterministic, both card and
peek): chapter-hue field (hue @ 12% over `card-2`) + oversized Lalezar initial
(first character of the product name, 56px, hue @ .5) + small ✦.

**E2E catalog placeholder SVG** (ADR-10): same deterministic-generator
contract, new art direction — hue gradient field + product initial + category
name + brand line «دِ‌لِ‌پِ»; **no emoji glyphs**. Production seed does not
create product images.

**Loading (TwinOrbit + skeletons).** Public menu Suspense fallback and the
boot overlay (`data-testid="menu-loading"`) are a centered TwinOrbit loader:
two `currentColor` discs (`size-4`, `text-primary`) orbiting at `translate(155%)`
for `TWIN_ORBIT_DURATION_MS` (1000ms) ease infinite, second disc delayed by half
the duration. Keyframes live in `globals.css`. After RSC data arrives, TwinOrbit
**stays up** until `MENU_BOOT_MIN_MS` (900) **and** hero-orbit + first four
product photos have preloaded (`MENU_BOOT_MAX_MS` 4500 fail-open). Reduced
motion skips the minimum hold but still waits for preloads (or max).

**Skeletons (shimmer boxes).** While a surface is not ready, a faded `bg-card-2`
box with the 1400ms shimmer sweep covers it; the real node stays mounted at
opacity 0 then fades in (`DURATION_BASE_MS`, ease-brand). Used on: hero (orbit
photos), product cards (until `MenuImage` ready), ticker thumbs, and in-image
placeholders. `prefers-reduced-motion` stops the sweep.

**Empty / error / 404 / footer.** Existing copy via strings; restyled with
identity tokens, three-spark dividers, stamp-styled primary button.

### Hero — high-priority visual experimentation area (binding)

The hero specification above is a **structural direction, not a
paint-by-numbers checklist**. Mechanically implementing it does not complete it.

During Phase 1, after first render, the hero must be evaluated against the
identity target:

> **young + energetic + appetizing + warm + cinematic + slightly rebellious +
> restaurant hangout**

- If the rendered hero reads as generic, empty, corporate, fine-dining, or
  visually weak: iterate on the composition — type scale and spacing, glow
  intensity, grain density, ticker prominence, motion timing, ambient layering —
  strictly within the approved tokens of this document.
- The Phase 1 phase report must contain an explicit **hero evaluation**:
  screenshots, the identity checklist above scored honestly, and the
  iterate/keep decision.
- The hero is done when it establishes «پاتوق» at first glance — not when the
  component mounts. Iteration rounds continue in later phases if needed; the
  hero remains a first-class review item through Phase 4 polish.

## Loading behavior

RSC streaming + TwinOrbit until boot images settle (min 900ms / max 4500ms).
Per-surface shimmer boxes until that surface’s media is ready. No fake menu data.

## Retired values

`THEME_CROSSFADE_MS`, `HERO_*` constants, all per-theme token tables, and
Markazi Text usage are removed from `lib/constants` / `fonts.ts` during
implementation (this doc supersedes them).