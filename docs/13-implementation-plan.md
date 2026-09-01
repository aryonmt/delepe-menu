# 13 · Implementation Plan (Agent Execution Order)

Rules: one milestone per PR/session · run `pnpm check` + relevant E2E before
ticking · commit convention per AGENTS.md · docs are the source of truth.

## M0 · Bootstrap
- [ ] Next 15 + TS strict + Tailwind + shadcn init + ESLint flat + Prettier
- [ ] `dir=rtl lang=fa`, fonts wiring (IRANSans local w/ Vazirmatn fallback, Markazi Text)
- [ ] `lib/env.ts`, `lib/fa/strings.ts`, `lib/utils.ts`
- [ ] docker compose (db), Prisma schema (doc 04) + initial migration
- [ ] `/api/health`, custom 404/error shells
- Verify: `pnpm check` green; `/` renders branded empty state.

## M1 · Domain & Infrastructure Core
- [ ] `domain/entities.ts`, `errors.ts`, `ports.ts`
- [ ] Prisma repositories (all ports) + in-memory fakes
- [ ] `di/container.ts`
- [ ] `format/price.ts` + `digits.ts` + unit tests (doc 04 table)
- Verify: unit tests green; container constructs every use-case.

## M2 · Auth & Recovery
- [ ] login/logout/change-password use-cases + Zod
- [ ] argon2 adapter, jose session adapter, rate limiter
- [ ] `/login` page (branded, Persian), middleware guard
- [ ] `scripts/admin-reset.ts` → `pnpm admin:reset`; MASTER env path
- [ ] E2E `auth.spec`
- Verify: 5-fail lockout works; master login logs warning.

## M3 · Seed + Public Menu v1
- [ ] `prisma/seed.ts` full real menu (doc 04) + image downloader w/ placeholder fallback
- [ ] `GetPublicMenuUseCase` + tagged cache
- [ ] Hero, sticky tabs + scrollspy, sections, product card, skeletons, empty/error
- Verify: seeded menu renders; scrollspy correct; E2E `public-menu.spec` (basic).

## M4 · Public Menu Polish
- [ ] Variants expand («از …»), discount UI, badges, MUTED/HIDE, chips filter
- [ ] Animation catalog A-01..A-08 + reduced motion
- [ ] Desktop 2-col grid; a11y pass; `a11y.spec`
- Verify: Lighthouse ≥ 90 mobile; all doc 06 acceptance criteria pass.

## M5 · Admin: Products
- [ ] Admin layout (sidebar/bottom-nav), unsaved-changes context
- [ ] Products list: search, category filter, pagination, availability switch
- [ ] Product drawer form (RHF+Zod) incl. discount/badges/variants editors
- [ ] Upload editor + `/api/admin/media/upload` (XHR progress) + `/media` serving + Sharp
- [ ] Delete confirm (BR-03) · dnd reorder (BR-07)
- [ ] E2E `admin-products.spec`
- Verify: add-product-with-image < 2 min usability pass.

## M6 · Admin: Categories, Settings, Live Preview
- [ ] Categories tree CRUD + dnd + delete guard (BR-02)
- [ ] Settings: name, theme cards, unavailable mode radios
- [ ] Draft store + phone-frame preview + «بازگشت به منوی ذخیره‌شده»
- [ ] Change-password dialog; mobile admin QA
- [ ] E2E `settings-preview.spec`
- Verify: editing price updates preview without save.

## M7 · Themes & Visual QA
- [ ] 4 themes tokens (doc 05) + cross-fade + contrast check per theme
- [ ] Ornament/frame motif polish; dark-theme shadows/glow tuning
- Verify: side-by-side visual review against doc 05; owner-look simplicity pass.

## M8 · Hardening & Ship
- [ ] CI workflow (doc 09); bundle check (admin libs not in public)
- [ ] Backup cron script + restore doc test; Caddyfile + compose prod profile
- [ ] README final pass; `.env.example`; security headers check (doc 10)
- Verify: fresh-clone → `docker compose up` → seeded app on a VPS in < 15 min.

## Feeding the agent

Per session: “Implement milestone **Mx** from `docs/13`, following `AGENTS.md`,
`docs/03`, `docs/08` and the feature specs. Finish with `pnpm check`, run the
listed E2E spec, tick the checkboxes, and commit.”