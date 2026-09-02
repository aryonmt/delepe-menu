# 05 · Design System

## Brand direction

Warm, premium café feel that echoes the physical menu: **deep coffee browns,
honey/gold accents, thin double-line frames and a small ✦ ornament** as the brand
motif. Motion is rich but always smooth (transform/opacity only, 60fps).

## Tokens (CSS variables, consumed by Tailwind config)

Every theme defines **all** of these variables (shadcn-compatible set + brand set):

```text
--background --foreground
--card --card-foreground
--primary --primary-foreground
--accent --accent-foreground
--muted --muted-foreground
--border --ring
--destructive --destructive-foreground
--ornament
--badge-popular  --badge-popular-foreground
--badge-new      --badge-new-foreground
--badge-spicy    --badge-spicy-foreground
--badge-vegetarian --badge-vegetarian-foreground
--radius            # 12px  (buttons, inputs — shadcn base)
--radius-card       # 18px
--radius-image      # 14px
--radius-drawer     # 24px (top corners)
```

All text/on-color pairs below were chosen for **WCAG contrast ≥ 4.5:1** (computed);
the M7 design-QA pass re-verifies every pair with a contrast tool (doc 13).

### Theme 1 · WARM_HONEY (default, light)

| var | value | | var | value |
| --- | --- | --- | --- | --- |
| background | `#FAF5EC` | | muted | `#F1E8D8` |
| foreground | `#2A211A` | | muted-foreground | `#6B5D4D` |
| card | `#FFFCF6` | | border | `#E7DCC9` |
| card-foreground | `#2A211A` | | ring | `#96601F` |
| primary | `#96601F` (honey caramel) | | destructive | `#B3261E` |
| primary-foreground | `#FFFFFF` | | destructive-foreground | `#FFFFFF` |
| accent | `#6E4B26` | | ornament | `#C89B54` (decorative only) |
| accent-foreground | `#FFFFFF` | | | |

Badges (bg / fg): POPULAR `#96601F`/`#FFFFFF` · NEW `#6E4B26`/`#FFFFFF` ·
SPICY `#B03A22`/`#FFFFFF` · VEGETARIAN `#2F6B3E`/`#FFFFFF`

> Primary adjusted from the original `#A9702B` to `#96601F` so both white text on
> primary (5.3:1) and primary text on card (5.1:1) pass AA.

### Theme 2 · MIDNIGHT_GOLD (dark)

| var | value | | var | value |
| --- | --- | --- | --- | --- |
| background | `#14100C` | | muted | `#241C13` |
| foreground | `#F4EADA` | | muted-foreground | `#A79883` |
| card | `#1E1812` | | border | `#35291C` |
| card-foreground | `#F4EADA` | | ring | `#D2A64C` |
| primary | `#D2A64C` | | destructive | `#E57367` |
| primary-foreground | `#241A08` | | destructive-foreground | `#2A0E0B` |
| accent | `#8F6C2F` | | ornament | `#D2A64C` |
| accent-foreground | `#FFFFFF` | | | |

Badges (bg / fg): POPULAR `#D2A64C`/`#241A08` · NEW `#8F6C2F`/`#FFFFFF` ·
SPICY `#E0664A`/`#2A0E0B` · VEGETARIAN `#63B088`/`#0F1F16`

### Theme 3 · IVORY_MINIMAL (light)

| var | value | | var | value |
| --- | --- | --- | --- | --- |
| background | `#FBFAF7` | | muted | `#F2F0EB` |
| foreground | `#201D19` | | muted-foreground | `#6E675C` |
| card | `#FFFFFF` | | border | `#E8E4DC` |
| card-foreground | `#201D19` | | ring | `#23201B` |
| primary | `#23201B` | | destructive | `#B3261E` |
| primary-foreground | `#FFFFFF` | | destructive-foreground | `#FFFFFF` |
| accent | `#9C6B1F` | | ornament | `#B08A3E` |
| accent-foreground | `#FFFFFF` | | | |

Badges (bg / fg): POPULAR `#23201B`/`#FFFFFF` · NEW `#9C6B1F`/`#FFFFFF` ·
SPICY `#B03A22`/`#FFFFFF` · VEGETARIAN `#2F6B3E`/`#FFFFFF`

### Theme 4 · DEEP_EMERALD (dark)

| var | value | | var | value |
| --- | --- | --- | --- | --- |
| background | `#0F1512` | | muted | `#1C2921` |
| foreground | `#ECE7DB` | | muted-foreground | `#93A296` |
| card | `#17211B` | | border | `#24352C` |
| card-foreground | `#ECE7DB` | | ring | `#63B088` |
| primary | `#63B088` | | destructive | `#E57367` |
| primary-foreground | `#0F1F16` | | destructive-foreground | `#2A0E0B` |
| accent | `#2E6B4F` | | ornament | `#C89B54` |
| accent-foreground | `#FFFFFF` | | | |

Badges (bg / fg): POPULAR `#C89B54`/`#241A08` · NEW `#7FC8A9`/`#0F1F16` ·
SPICY `#E0664A`/`#2A0E0B` · VEGETARIAN `#63B088`/`#0F1F16`

Theme is applied via `<html data-theme="warm-honey | midnight-gold | ivory-minimal |
deep-emerald">` (kebab-case attribute value mapped from the `ThemeName` enum).
Switching cross-fades colors (300ms) using CSS `transition` on color properties only.

## Typography

- Body: **IRANSans** (self-hosted woff2 **400/500/700**) → fallback **Vazirmatn**.
- Display (hero title, category titles): **Markazi Text** 600/700 (OFL, next/font).
- Scale (mobile-first): body 15px/1.9 · secondary 12.5px/1.8 · card title 15.5px/700 ·
  section title 22px display · hero title **36px** (40px at `md+`) display ·
  price 15px/**700** (heaviest available IRANSans weight).
- Persian rules: ZWNJ (نیم‌فاصله) in all strings, including seed data
  («می‌شود», «هویج‌بستنی», «توت‌فرنگی»); **no letter-spacing** on Persian text;
  Persian digits everywhere in UI; Persian punctuation (، ؟).

## Shape & elevation

- Radius: tokens above (`--radius*`).
- Shadows: warm soft `0 8px 24px rgb(42 33 26 / .08)` on light themes;
  dark themes use borders + inner glow instead (no drop shadows).
- Brand frame motif: 1px double border with corner ticks (like the printed menu)
  used on hero and section titles; ornament `✦` as divider glyph.

## Motion tokens

| token | value |
| --- | --- |
| duration-fast | 150ms |
| duration-base | 260ms |
| duration-slow | 450ms |
| ease-out | cubic-bezier(.22,.61,.36,1) |
| spring | stiffness 380 · damping 32 (indicators) |
| stagger | 40ms |
| reveal-y | 16px |

All animations: transform/opacity only. `prefers-reduced-motion` → durations 0.
Motion library: `motion/react` (Motion v12, doc 02 ADR-09).

## Icons & badges

lucide-react **main package only**. Badge map:

| badge | Persian | lucide icon | colors |
| --- | --- | --- | --- |
| POPULAR | پرفروش | `Flame` | `--badge-popular` / fg |
| NEW | جدید | `Sparkles` | `--badge-new` / fg |
| SPICY | تند | `FlameKindling` | `--badge-spicy` / fg |
| VEGETARIAN | گیاهی | `Leaf` | `--badge-vegetarian` / fg |

(`Pepper` does not exist in lucide-react main; `FlameKindling` is the fixed choice —
do not substitute, do not add @lucide/lab.)

## RTL rules

- `<html dir="rtl" lang="fa">`; Tailwind logical utilities (`ms-*, me-*, ps-*, pe-*,
  start-*, end-*`) only — no physical left/right in components.
- Horizontal scrollers: `scroll-padding-inline-start`, indicator math RTL-aware.
- Icons that imply direction (chevrons) mirrored via `rtl:rotate-180`.

## Component specs (visual)

### Product card (horizontal)

Card row: image block inline-start **104×78px** mobile / **140×105px** at `md+`
(4:3, radius-image) · content: title (700), description 2-line clamp muted,
footer row: price (primary, 700) + old price line-through muted (when discounted)
+ percent chip · badges row above title · unavailable (MUTED): image
`grayscale(1) opacity(.55)`, card opacity .7, «ناموجود» chip on image ·
press feedback scale .98 · variants: chevron-down button inline-end rotates 180°
when open.

### Category tabs

Sticky top, backdrop-blur, horizontal scroll, pill indicator animated with
`layoutId` spring; active tab scrolls into view; tab = display font 15px.

### Sub-category chips

Row under tabs (only when active category has children): chip «همه» + children;
active chip filled primary; content change animates with `popLayout`.

### Section header (top-level category)

Display font 22px + ornament: `─── ✦ ───` rendered with gradient lines.

### Sub-header (child group inside a section)

Display font **18px** + single thin gradient line on the inline-end side only
(no ✦ ornament) — visually subordinate to the section header.

### Skeletons & states

Shimmer skeleton cards (3) while streaming; empty menu → ornament +
«منو به‌زودی تکمیل می‌شود»; error → friendly Persian + retry button.

### Hero

Height **200px**, shrinks to **120px** once `scrollY > 80` (scroll-linked
scale/opacity). Restaurant name in display font, brand frame motif, two
slow-drifting radial glows (transform only, 12s loop), ornament draw-in on load.
