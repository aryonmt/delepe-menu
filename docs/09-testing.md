# 09 · Testing Strategy

Pyramid: **unit** (rules & formatting) → **E2E** (critical journeys).
No integration layer: use-cases are unit-tested with in-memory repository fakes.

## Unit (Vitest)

- `lib/format/price` — exact cases from doc 04 table.
- `lib/format/digits` — Persian digit conversion.
- Every use-case: happy path + each BR rule it owns
  (e.g. `DeleteCategoryUseCase` → `CategoryNotEmptyError` with products/children).
- Zod schemas: boundary cases (discount ≥ price, name lengths, price limits).
- Colocation: `src/**/*.test.ts` next to source. Fakes in `src/domain/testing/`.

## E2E (Playwright, `/e2e`)

Config: `webServer: pnpm start` against a **seeded test DB** (compose profile `test`),
Persian locale, mobile viewport 390×844 + desktop pass.

Critical specs:

| Spec | Covers |
| --- | --- |
| `public-menu.spec` | Load, hero, tabs scrollspy, chips filter, variants expand («از …»), discount UI, badges, MUTED grayscale + HIDE absence, empty/error states |
| `auth.spec` | Login success/failure (generic Persian error), logout, change password, rate limit after 5 fails |
| `admin-products.spec` | Create with upload (fixture image), edit, discount validation, availability switch, delete confirm, reorder persistence |
| `admin-categories.spec` | Create child (depth guard), delete guard toast, reorder |
| `settings-preview.spec` | Theme switch reflects in phone preview + public after save; unavailable mode switch; draft reset button |
| `a11y.spec` | axe-core scan of `/`, `/login`, `/admin/products` — zero critical violations |

## CI (GitHub Actions)

Job `quality`: install → `pnpm lint` → `pnpm typecheck` → unit → build → e2e
(with services: postgres). Playwright report + trace uploaded as artifacts.
Branch protection: `quality` must pass on PRs to `main`.