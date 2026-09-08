# 15 · M7 Identity & Visual QA

Single «پاتوق» identity (ADR-12). Contrast computed with WCAG 2.1 relative
luminance (`src/lib/contrast.ts`). Token source: `docs/05` /
`src/lib/identity-tokens.ts`.

## T-070 · Identity wiring

- Root and public layouts have no `data-theme` attribute.
- `globals.css` has one `:root` token block and no `[data-theme]` selectors.
- `Settings.theme` remains in the data model and is visually inert.
- Asserted by `src/lib/identity-wiring.test.ts`.

## T-071 · Contrast (AA 4.5:1)

Two documented pairs failed the first pass and were corrected in docs/05 in
this milestone (do not invent tokens silently):

| Token | Before | After | Reason |
| --- | --- | --- | --- |
| `--muted-2` | `#756350` | `#968064` | 3.27:1 on `--card` (tertiary / strikethrough) |
| `--accent` | `#B86E20` | `#A86218` | 3.97:1 with `--accent-foreground` `#FFFFFF` |

| Pair | Ratio |
| --- | --- |
| foreground / background | 16.74 |
| card-foreground / card | 15.91 |
| card-foreground / card-2 | 14.88 |
| muted-foreground / background | 6.78 |
| muted-foreground / card | 6.44 |
| muted-foreground / muted | 5.89 |
| muted-2 / background | 5.24 |
| muted-2 / card | 4.98 |
| muted-2 / card-2 | 4.65 |
| primary-foreground / primary | 8.74 |
| accent-foreground / accent | 4.75 |
| spark-foreground / spark | 5.44 |
| badge POPULAR | 8.74 |
| badge NEW | 9.46 |
| badge SPICY | 5.44 |
| badge VEGETARIAN | 6.03 |

Chapter hues vs `--background` / `--card` are all ≥ 3:1. Tomato `#D96C4A` and
flame `#E8763D` stay distinct.

`--spark` is a fill (stamps/badges), not small body text.

## Wordmark, glow, grain

- Brand string is still the locked sequence; clusters render as دِ / لِ / پِ
  with extra line-box padding so kasras are not clipped.
- Hero wordmark size aligned to docs/05: 64px mobile / 88px `md+`, lh 1.15.
- Grain overlay stays at opacity `.035` (docs/05). Ambient glows stay the
  documented ember / spark radials.
- Solar default `--orbit-accent` is ember `#E8A33D` (was a leftover teal).

## Owner look

Side-by-side against docs/05 is a human pass: hero hangout feel, three-spark
readability on Chrome desktop / Android / iOS, tomato vs flame in chapter
accents.
