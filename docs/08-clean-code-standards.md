# 08 · Clean Code & SOLID Standards

## SOLID mapping

| Principle | How it is honored |
| --- | --- |
| SRP | One use-case class per operation (`CreateProductUseCase` does orchestration only). Components render only. Repositories persist only. |
| OCP | Badges, themes, unavailable modes are data (maps/enums) — new badge = new entry, no logic change. |
| LSP | Any `PrismaXRepository` is substitutable for port `XRepository` (unit tests use in-memory fakes from `src/domain/testing/`). |
| ISP | Ports are small: `ProductReader`, `ProductWriter` split where consumers differ. |
| DIP | Use-cases depend on domain ports; wiring only in `infrastructure/di/container.ts`. |

## Rules

- **Files ≤ 300 lines**, functions ≤ 40 lines, params ≤ 4 (else options object).
- **No `any`, no `@ts-ignore`, no `!`** without an explanatory comment.
- **No magic values**: constants or tokens (durations, limits in `lib/constants.ts`).
- **Immutability**: never mutate state/props/DTOs; return new objects.
- **No business logic** in `src/app/**`, components, or repositories.
- **No Prisma import** outside `infrastructure/prisma/**`.
- **No `process.env`** outside `lib/env.ts` (zod-validated, fail-fast at boot).
- **Persian strings** only in `lib/fa/strings.ts` (typed keys, grouped by feature).
- **Comments/docstrings English**; JSDoc on every exported use-case/port/util.
  Explain *why*, not *what*. No commented-out code ever.
- **Naming**: files `kebab-case.ts(x)`; components `PascalCase`;
  use-cases `VerbNounUseCase`; ports `NounRepository`/`NounService` interfaces;
  adapters `PrismaNounRepository`, `LocalDiskStorage`; DTOs `NounDto`;
  schemas `createNounSchema`; domain errors `NounError extends DomainError`.
- **Error handling**: use-cases throw typed `DomainError`s with stable `code`;
  server actions catch → `ActionResult { ok:false, error:{code, fa} }`;
  unexpected errors logged (infra logger) and mapped to a generic Persian message.
  Never throw raw strings; never leak stack traces to UI.
- **Imports order**: react → next → libs (alias `@/`) → relative; alias `@/*`.
  Motion imports come from `motion/react` (never `framer-motion`).
- **UI state**: local `useState` first; shared admin state only via the draft store.
- **IDs**: `cuid()`; times UTC in DB, rendered via fa formatter.
- **Pure mappers** (e.g. `toPublicMenu`) live in `application/mappers/` and are
  the only allowed bridge between admin draft data and public rendering.

## PR / self-review checklist

- [ ] Layers respected; new code in the correct folder (doc 03 tree)
- [ ] Zod at boundary; domain rules inside use-case; Persian messages mapped
- [ ] Loading/empty/error states + toasts where relevant
- [ ] Animations transform/opacity + reduced-motion respected
- [ ] Unit tests for new rules; E2E updated for new flows
- [ ] `pnpm check` green; docs updated if stack/spec changed
