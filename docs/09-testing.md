# 09 · Testing Strategy

Pyramid: **unit** (rules & formatting) → optional **Prisma integration**
(`pnpm test:integration`) → **E2E** (critical journeys).
Use-cases are unit-tested with in-memory repository fakes
(`src/domain/testing/`). Prisma repository behavior against Postgres lives in
`*.integration.test.ts` and is **not** part of `pnpm test`.

## Workflow (local-first TDD — per task in doc 13)

1. Read the feature spec + its acceptance criteria.
2. **Write the tests first** (unit for rules/mappers; E2E skeleton for flows).
3. Implement until tests pass.
4. Refactor within the architecture rules (doc 08).
5. Run `pnpm check` + relevant E2E spec, strike through the task row in
   `docs/13`, commit.

Tests are written and run **locally**; CI (bottom) is the final gate, not the
development loop.

## Unit (Vitest)

- `lib/format/price` — exact golden cases from doc 04 (including carry + minimum).
- `lib/format/digits` — Persian ↔ ASCII digit conversion.
- `lib/contrast` + `lib/identity-tokens` — every docs/05 text/on-color pair
  ≥ 4.5:1; chapter hues ≥ 3:1; single-identity wiring (no `data-theme`).
- `application/mappers/to-public-menu` — HIDE filters unavailable, MUTED keeps
  them, empty categories pruned, settings passthrough.
- Every use-case: happy path + each BR it owns
  (e.g. `DeleteCategoryUseCase` → `CategoryNotEmptyError` with products/children;
  `CreateProductUseCase` → BR-13 auto-price from variants, BR-14 discount
  rejection with variants, BR-15 non-leaf rejection).
- Zod schemas: boundary cases (discount ≥ price, name lengths, price limits).
- Colocation: `src/**/*.test.ts` next to source. Fakes in `src/domain/testing/`.

Run: `pnpm test` (single run, no database) · `pnpm test:watch` (dev loop).
`pnpm test:integration` runs Prisma repository specs against `E2E_DATABASE_URL`
(default compose `db-test` on 5433) and skips when that database is unreachable.

## E2E (Playwright, `/e2e`)

Local prerequisite: `docker compose --profile test up -d db-test` (Postgres 16 on
host port **5433**, database `delepe_test`, doc 12).

`e2e/global-setup.ts` then:
1. runs `prisma migrate deploy` against `E2E_DATABASE_URL` (default
   `postgresql://delepe:delepe@localhost:5433/delepe_test`);
2. runs `tsx prisma/seed.ts` against that same URL (menu + media; skips admin
   bootstrap when `ADMIN_*` are unset);
3. runs `scripts/admin-reset.ts` against that same URL so the admin exists in
   the **test** database, not the dev database on 5432.

E2E runs on `E2E_PORT` (default **3100**) so a dev server on 3000 is never reused.
Playwright `webServer` runs `node scripts/e2e-webserver.mjs` (wipe `.next`, then
`pnpm db:deploy && pnpm db:seed && pnpm build && pnpm start`) with
the test `DATABASE_URL` and repo `STORAGE_ROOT` so the running app
matches the seeded test database (including `unavailableMode: MUTED`). `db:deploy`
runs first because webServer starts before `globalSetup` and the test database
must have every Settings column (including `tickerProductIds`) before seed.
The webServer timeout is **10 minutes** so Windows `next build` (including trace
collection) can finish before Playwright probes `/api/health`.
It listens on `E2E_PORT`. Persian locale, mobile viewport 390×844 + desktop pass.

CI must set `E2E_DATABASE_URL` to the job's service Postgres. The `quality`
job runs `pnpm db:deploy` before `pnpm build` so a migrated schema exists if
Next still evaluates the public menu during collect-page-data. Playwright `webServer` / global-setup still
migrate and seed for E2E independently.

Seeded SVG placeholders for public-menu specs land in M3 (ADR-10).

Critical specs:

| Spec | Covers |
| --- | --- |
| `public-menu.spec` | Load, hero, tabs scrollspy, chips filter, variants expand («از …» on مارگاریتا), discount UI (−۱۷٪ کوکی), badges, MUTED grayscale + HIDE absence, empty/error states |
| `auth.spec` | Login success/failure (generic Persian error), logout, change password, redirect rules (`/admin` → products; authed `/login` → products), **rate limit: 5 fails → 6th attempt returns `RATE_LIMITED` + «تعداد تلاش‌ها بیش از حد مجاز است؛ ۱۵ دقیقه دیگر تلاش کنید»** |
| `admin-products.spec` | Create with upload (fixture image), edit, discount validation, availability switch (optimistic + revert on failure), delete confirm, product-row dnd absent (order lives on categories), Persian-digit price input, variant auto-price (BR-13), discount hidden with variants (BR-14) |
| `admin-categories.spec` | Create child (depth guard BR-01), child-under-product-owner guard (BR-16), delete guard toast (BR-02), reorder |
| `settings-preview.spec` | Preview reflects the single «پاتوق» identity for both draft and saved state (no public theme switcher exists; the legacy 4-theme system is retired per ADR-12); settings mutations (restaurant name, unavailable mode) reflected in the phone preview and, after save, on the public menu; draft reset button; drawer cancel leaves preview unchanged |
| `a11y.spec` | axe-core scan of `/`, `/login`, `/admin/products` — zero critical violations |

## CI (GitHub Actions)

Job `quality`: install → `pnpm lint` → `pnpm typecheck` → `pnpm test` →
`pnpm db:deploy` (job Postgres) → `pnpm build` → bundle check
(`pnpm check:bundle` / `@next/bundle-analyzer`: `@dnd-kit`, `react-easy-crop`
absent from the public bundle) → `pnpm audit --audit-level=high`
(advisory) → `pnpm test:e2e` (same `E2E_DATABASE_URL`; webServer migrate/seed).
Playwright report + trace uploaded as artifacts.
Branch protection: `quality` must pass on PRs to `main`.
