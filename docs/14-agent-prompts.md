# 14 · Coding Agent Prompts (ready to use)

One prompt per milestone. Paste verbatim into a fresh agent session.
Every prompt assumes the repo root is the working directory and docs are the
source of truth. Never skip the "Read first" list — it is ordered.

Shared trailer for every prompt (already included below in full for M0; for M1–M8
the same rules are referenced as "standard trailer"):

> **Standard trailer**: Follow `AGENTS.md` hard rules: English identifiers/comments,
> Persian UI strings only via `src/lib/fa/strings.ts`, TS strict (no `any`,
> no `@ts-ignore`), layer boundaries per `docs/03`, no new dependencies unless
> `docs/02` is updated in the same commit, files ≤ 300 lines, Motion imports from
> `motion/react`. Workflow is TDD per `docs/09`: write tests first, implement,
> refactor. Finish with `pnpm check` + the listed E2E spec green, strike through
> the task rows in `docs/13`, and commit (`<type>: <short English imperative>`).
> If a doc and reality conflict, stop and fix the doc first — never guess.

---

## M0 · Bootstrap

```text
You are implementing milestone M0 of the Delepe Menu project (Persian RTL
digital QR menu, Next.js 15 + TS strict + Tailwind 3.4 + shadcn/ui).

Read first, in this order: AGENTS.md → docs/01-product-overview.md →
docs/02-tech-stack.md → docs/03-architecture.md → docs/05-design-system.md →
docs/09-testing.md → docs/13-implementation-plan.md (M0 only).

Goal: tasks T-001..T-005 — a runnable, themed, fully checked skeleton.

Constraints:
- Pin dependencies exactly per docs/02 (Node 22, pnpm 10, package `motion`, no
  `framer-motion`).
- globals.css must define EVERY token in docs/05 for ALL 4 themes
  (data-theme attribute values are the kebab-case names listed there).
  **Historical — superseded by ADR-12 / M4R: a single «پاتوق» identity.**
- IRANSans loads from src/fonts/iransans/ with Vazirmatn fallback when files are
  missing; Markazi Text via next/font. No runtime Google Fonts requests.
- lib/format/price.ts + digits.ts are implemented test-first against the golden
  table in docs/04 (including the carry case 1999500 → «۲ میلیون تومان»).

Expected files: full Next scaffold per the docs/03 folder tree (M0 subset),
.env.example, docker-compose.yml (db + test profile), prisma/schema.prisma
exactly per docs/04 + initial migration, /api/health, branded not-found.tsx and
error.tsx.

Tests: pnpm test (price/digits golden table), pnpm check green.

Validation checklist:
- [ ] `docker compose up -d db` + `pnpm db:migrate` succeed from a clean clone
- [ ] `/` renders a branded empty state in RTL with WARM_HONEY tokens
- [ ] `/api/health` returns { ok: true, db: true }
- [ ] golden price tests pass

Standard trailer applies.
```

## M1 · Domain & Infrastructure Core

```text
You are implementing milestone M1 of Delepe Menu.

Read first: AGENTS.md → docs/03-architecture.md → docs/04-data-model.md →
docs/08-clean-code-standards.md → docs/13 (M1).

Goal: tasks T-010..T-014 — the complete domain + application layer with
in-memory fakes and Prisma repositories, unit-tested without HTTP.

Constraints:
- domain/ has ZERO imports from other layers; Prisma types never leak into DTOs.
- Every business rule BR-01..BR-16 in docs/04 is owned by exactly one use-case
  and has at least one unit test (name tests after the rule, e.g.
  "rejects discount on product with variants (BR-14)").
- toPublicMenu mapper is pure and tested for HIDE, MUTED, and empty-category
  pruning.
- BR-13: use-cases recompute product.price = min(variant prices) on every
  variant mutation. BR-09 uniqueness is enforced in use-cases, NOT trusted to
  the DB (see the NULL note in docs/04).
- Media use-cases (UploadMedia/DeleteMedia) and stub storage/optimizer adapters
  (PassthroughImageOptimizer, LocalDiskStorage) are included in M1 to satisfy
  the docs/04 contract-completeness checklist. Auth use-cases
  (Login/Logout/ChangePassword/VerifySession) remain deferred to M2 by design.

Expected files: src/domain/**, src/application/**, src/infrastructure/prisma/**,
src/infrastructure/di/container.ts, src/domain/testing/*,
src/infrastructure/image/optimizer.ts, src/infrastructure/storage/*.

Tests: pnpm test green (mapper + all BR cases); a container test constructs
every M1 use-case (menu/category/product/settings/media — not auth).

Validation checklist:
- [ ] no `import .*prisma` outside infrastructure (grep)
- [ ] every non-auth use-case in the docs/04 contract table exists with that
      exact I/O (media included; Login/Logout/ChangePassword/VerifySession are M2)
- [ ] pnpm check green

Standard trailer applies.
```

## M2 · Auth & Recovery

```text
You are implementing milestone M2 of Delepe Menu.

Read first: AGENTS.md → docs/10-security.md → docs/03-architecture.md →
docs/04-data-model.md (auth use-cases + Login/ChangePassword schemas) →
docs/07-admin-panel-spec.md (routes) → docs/13 (M2).

Goal: tasks T-020..T-024 — login/logout/change-password/verify-session,
argon2id + jose adapters, rate limiter, /login page, middleware, admin-reset CLI.

Constraints:
- Cookie `delepe_session`: HttpOnly, SameSite=Lax, Path=/ (exactly — see docs/10),
  Secure in production; JWT payload { sub: AdminUser.id, iat, exp=iat+7d }.
- Middleware runs on edge: jose only, no Prisma/argon2 imports there.
- Rate limit: 5 attempts / 15 min per (ip+username); the 6th returns code
  RATE_LIMITED with the EXACT Persian string in docs/10 (E2E asserts verbatim);
  300ms constant delay on failure; generic error otherwise.
- MASTER_USERNAME/MASTER_PASSWORD path only when BOTH are set; log a warning line.
- `/admin` redirects to `/admin/products`; authed users visiting /login redirect too.

Tests: unit (adapters, rate limiter, use-cases) then E2E e2e/auth.spec —
write the spec FIRST, including the lockout row.

Validation checklist:
- [ ] e2e/auth.spec fully green
- [ ] unauthenticated /admin/products → redirect to /login
- [ ] pnpm admin:reset --username x --password y works against the dev DB

Standard trailer applies.
```

## M3 · Seed + Public Menu v1

```text
You are implementing milestone M3 of Delepe Menu.

Read first: AGENTS.md → docs/04-data-model.md (seed tables — copy descriptions
and imageKeywords VERBATIM) → docs/03-architecture.md (data flow, caching) →
docs/05-design-system.md → docs/06-public-menu-spec.md → docs/13 (M3).

Goal: tasks T-030..T-033 — idempotent seed with deterministic SVG placeholders
+ media pipeline (SharpImageOptimizer, /media/[mediaId] route, MenuImage +
lib/media-url.ts), GetPublicMenuUseCase with tagged cache, public page v1
(hero, tabs + scrollspy, sections, product card, skeletons, empty/error).

Constraints:
- Seed works with the network DISABLED (SVG placeholders by default, ADR-10);
  SEED_DOWNLOAD_IMAGES=true is the only network path and always falls back to SVG.
  Seed ingests every image through SharpImageOptimizer (original + 320/640/960 WebP
  + dominantColor), creates Media rows, and is idempotent via upserts and skipping
  existing files (raster inputs saved as JPEG q0.92; SVGs rasterized).
- Media pipeline: SharpImageOptimizer implements the same ImageOptimizer port;
  /media/[mediaId]?w= validates w ∈ {320,640,960} (default 640), streams
  pre-generated WebP with Cache-Control immutable, 404 on bad id/w, originals
  never served; lib/media-url.ts helper + MenuImage with custom loader
  (≤320→320, ≤640→640, else 960), 1:1, dominantColor + shimmer.
- Admin bootstrap: create the admin from ADMIN_USERNAME/ADMIN_PASSWORD only when
  AdminUser count = 0.
- Scrollspy: IntersectionObserver rootMargin "-40% 0px -55%"; tabs indicator via
  layoutId spring (docs/05 motion tokens).
- The page is RSC; client JS only in the doc-06 islands.

Tests: unit (media-url, SharpImageOptimizer fixture, cache helper); E2E
public-menu.spec rows 1–2 (write the spec file now; unimplemented rows may be
test.fixme with a comment referencing the doc row).

Validation checklist:
- [ ] pnpm db:seed twice → no duplicates and no duplicate storage files
- [ ] /media serves 320/640/960 WebP with immutable headers; 404 on bad w/id
- [ ] «آب کرفس» renders grayscale (seeded isAvailable=false, default mode MUTED)
- [ ] pnpm check green

Standard trailer applies.
```

## M4 · Public Menu Polish

```text
You are implementing milestone M4 of Delepe Menu.

Read first: AGENTS.md → docs/06-public-menu-spec.md (full) →
docs/05-design-system.md (motion tokens, card spec) →
docs/03-architecture.md (media pipeline) → docs/11-performance-accessibility.md →
docs/13 (M4).

Goal: tasks T-040..T-043 — variants, discount, badges, MUTED/HIDE, chips,
full animation catalog, desktop 2-col grid only, a11y + Lighthouse
(media pipeline already landed in M3 T-033).

Constraints:
- Desktop grid: content column max-w-2xl centered; at md+ cards become a
  2-column grid within sections (same card component, 140×105 image) —
  MenuImage + media route already exist from M3.
- Every animation transform/opacity only, durations from docs/05 tokens;
  prefers-reduced-motion disables all of them.
- Enable the previously fixme'd public-menu.spec rows 3–6 and make them pass
  (مارگاریتا «از ۵۵۰ هزار تومان», کوکی متوسط −۱۷٪ chip, HIDE/MUTED switch).

Tests: public-menu.spec full green; a11y.spec (axe) zero critical violations;
Lighthouse ≥ 90 mobile on /.

Validation checklist:
- [ ] first-load JS for / ≤ 220KB gzipped (build output)
- [ ] no layout shift on image load (dominantColor placeholder)
- [ ] pnpm check green

Standard trailer applies.
```

## M5 · Admin: Products

```text
You are implementing milestone M5 of Delepe Menu.

Read first: AGENTS.md → docs/07-admin-panel-spec.md (full — especially the
draft-store rules) → docs/03-architecture.md (media pipeline, conventions) →
docs/04-data-model.md (contracts, BR-03/04/07/12/13/14/15) → docs/13 (M5).

Goal: tasks T-050..T-054 — admin layout + draft store, products list, drawer
form, upload editor with XHR progress, delete confirm, dnd reorder.

Constraints:
- Draft store rules are EXACTLY the six numbered rules in docs/07: full-snapshot
  hydration via GetAdminMenu, client-side pagination/search (20/page), drawer
  edits a local copy (Save writes through; Cancel discards), optimistic
  availability switch with revert, draft in memory only.
- Numeric inputs accept Persian digits; normalize in the form layer before Zod.
- Variant products: price input disabled + auto = min(variants); discount section
  hidden (BR-13/14).
- Upload: react-easy-crop 1:1 → JPEG q0.92 → XHR to /api/admin/media/upload with
  real upload progress reusing SharpImageOptimizer from M3; orphan media deleted
  on cancel (DeleteMedia).
- Reorder enabled only for a single selected leaf category with empty search.

Tests: unit (store mutators, schemas) first; then e2e/admin-products.spec
(including a fixture-image upload, Persian-digit price, reorder persistence
across reload).

Validation checklist:
- [ ] admin heavy libs (@dnd-kit, react-easy-crop) dynamically imported
- [ ] add-product-with-image manual pass < 2 minutes
- [ ] pnpm check green

Standard trailer applies.
```

## M6 · Admin: Categories, Settings, Live Preview

```text
You are implementing milestone M6 of Delepe Menu.

Read first: AGENTS.md → docs/07-admin-panel-spec.md (categories, settings,
preview sections) → docs/04-data-model.md (BR-01/02/10/15/16) →
docs/05-design-system.md → docs/13 (M6).

Goal: tasks T-060..T-063 — categories tree CRUD + dnd + guards, settings page,
phone-frame live preview, change-password dialog.

Constraints:
- Preview = pure components/menu/* fed with toPublicMenu(draft) — do NOT write a
  separate preview renderer and do NOT fetch public data for it.
- Category guards produce the exact Persian toasts from docs/07 (BR-02, BR-16).
- Theme picker applies to the preview immediately and to the public site only
  after save (draft settings vs saved settings).
- «بازگشت به منوی ذخیره‌شده» calls resetToSaved() and re-renders from saved data.

Tests: e2e/admin-categories.spec + e2e/settings-preview.spec (write first);
assert preview updates on price edit WITHOUT save and that drawer-cancel leaves
the preview unchanged.

Validation checklist:
- [ ] deleting a category with products → guard toast, nothing deleted
- [ ] dirty form + navigation → confirm dialog
- [ ] pnpm check green

Standard trailer applies.
```

## M7 · Identity & Visual QA

```text
You are implementing milestone M7 of Delepe Menu.

Read first: AGENTS.md → docs/05-design-system.md (full) →
docs/11-performance-accessibility.md → docs/13 (M7).

Goal: tasks T-070..T-071 — verify the single «پاتوق» identity (ADR-12): no
data-theme on the public layout, one token set, contrast of every docs/05
text/on-color pair, three-spark/wordmark polish, glow and grain within
documented values.

Constraints:
- Token values are EXACTLY the docs/05 tables — do not invent or tweak colors.
  If a pair fails the contrast check, stop and report it (that means the doc is
  wrong; fix the doc in the same commit with the corrected value).
- Settings.theme stays in the data model and stays visually inert.

Tests: unit contrast check (WCAG 4.5:1) of every text/on-color pair; wiring
test that layouts/globals have no data-theme; QA report in docs/15;
visual side-by-side review against docs/05.

Validation checklist:
- [ ] public UI uses one identity; no data-theme attribute
- [ ] contrast report shows ≥ 4.5:1 on every text pair
- [ ] wordmark kasras unclipped; grain/glow match docs/05

Standard trailer applies.
```

## M8 · Hardening & Ship

```text
You are implementing milestone M8 of Delepe Menu.

Read first: AGENTS.md → docs/09-testing.md (CI) → docs/12-deployment.md (full) →
docs/10-security.md (headers) → README.md → docs/13 (M8).

Goal: tasks T-080..T-084 — CI quality job, backup/restore scripts, Caddyfile +
production compose + Dockerfile, README/.env.example final pass, VPS drill.

Constraints:
- CI job steps exactly per docs/09, including the bundle check (admin libs must
  be absent from the public bundle) and pnpm audit (advisory).
- Dockerfile: node:22-bookworm-slim multi-stage, non-root runner, entrypoint runs
  prisma migrate deploy then node server.js.
- Runbook includes the one-shot seed step (docker compose exec app pnpm db:seed).
- .env.example documents every variable in docs/12 with comments.

Tests: CI green on the PR; timed fresh-clone deploy drill (< 15 min to a healthy
seeded app); backup restore drill documented.

Validation checklist:
- [ ] /api/health green on the VPS
- [ ] security headers present (docs/10 list)
- [ ] restore drill succeeded

Standard trailer applies.
```
