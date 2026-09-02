# Agent Instructions

This project is implemented by AI coding agents under human review.
These rules are **mandatory**. When documents conflict, the more specific document wins;
`docs/13` defines implementation order and `docs/14` contains the prompt that
started your session — re-read it.

## Reading order (before any code)

1. `docs/01-product-overview.md`
2. `docs/03-architecture.md`
3. `docs/08-clean-code-standards.md`
4. The specific spec for the feature you implement (04–07, 09–12)
5. `docs/13-implementation-plan.md` (your current milestone)

## Workflow (TDD, local-first — docs/09)

1. Read the feature spec + acceptance criteria.
2. Write the tests first (unit for rules/mappers; E2E spec rows for flows).
3. Implement until green. 4. Refactor within the architecture rules.
5. `pnpm check` + relevant E2E → strike through the task row in `docs/13` → commit.

## Hard rules

- **Language**: identifiers, comments, docstrings, docs, commit messages → English.
  All user-facing UI strings → Persian, and ONLY via `src/lib/fa/strings.ts`.
- **TypeScript strict**: no `any`, no `@ts-ignore`, no non-null assertions without a comment.
- **Architecture**: respect the dependency rule
  `domain ← application ← infrastructure ← app/components`.
  Domain has zero imports from other layers. Components are presentational (props in, events out).
- **No new dependencies** unless added to `docs/02-tech-stack.md` in the same commit.
- **Motion**: imports from `motion/react` only. Never install `framer-motion`.
- **One feature per task**: schema → tests → use-case → repository → UI, in order.
- **Files ≤ 300 lines**; extract instead of growing.
- **Every mutation** = Zod schema + use-case class + server action wrapper + Persian error mapping.
- **Every repository port** lives in `src/domain/ports.ts`; implementations live in `infrastructure/`.
- **Never** put business logic in `src/app/**` or in components.
- **Never** call Prisma outside `src/infrastructure/prisma/**`.
- **Never invent visual values**: colors, radii, durations, and copy come from
  `docs/05` / `docs/06` / `docs/07`. If a needed value is missing, stop and add it
  to the doc first.
- **Visual quality is a first-class requirement**: follow `docs/05` and `docs/06`
  exactly; animations transform/opacity only; respect `prefers-reduced-motion`.
- **Doc/code conflicts**: docs win. Update the doc in the same commit if the doc
  is wrong; never silently diverge.
- **Before marking a task done**: run `pnpm check` (lint + typecheck + unit +
  build) and the relevant Playwright spec; then strike through the task row in
  `docs/13-implementation-plan.md`.
- **Next.js 15 APIs**: Always `await cookies()`, `await headers()`, and `await params`.
- **Server Action Redirects**: Never call `redirect()` inside a try/catch block that intercepts all errors without rethrowing `NEXT_REDIRECT`.
- **Prisma Client**: Always use the global singleton pattern for Prisma in `src/infrastructure/prisma/client.ts`.
- **No Direct Mutation**: Never mutate Zustand state directly; use immutable updates.


## Never change without reconsideration (flag to the human first)

- The business rules BR-01..BR-16 (`docs/04`)
- The media pipeline contract (`docs/03`)
- The session/cookie model (`docs/10`)
- The milestone order (`docs/13`)
- Any pinned dependency line (`docs/02`)

## Commit convention

`feat:`, `fix:`, `refactor:`, `style:`, `test:`, `docs:`, `chore:` + short English imperative summary.
Example: `feat: add product reorder use-case and dnd list`.

## Definition of Done (per task)

- [ ] Code follows `docs/08` and architecture layers
- [ ] Tests written first and green (unit and/or E2E per the task row in docs/13)
- [ ] UI strings Persian via strings file; comments English
- [ ] Zod validation at the boundary; domain errors typed; Persian messages mapped
- [ ] Loading / empty / error states implemented
- [ ] `pnpm check` green; relevant E2E green
- [ ] Task row struck through in `docs/13`
