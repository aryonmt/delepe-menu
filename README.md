# Delepe Menu

A visually rich, mobile-first **digital QR menu** for **Delepe Café Restaurant**, with a
simple but beautiful admin panel for the owner.

- Customers scan a QR code and browse the menu on their phone. **No digital ordering** — ordering stays traditional.
- The owner manages categories, products, prices, images, availability, discounts and themes from a simple Persian admin panel.

> This repository is the single source of truth. All planning documents live in `docs/`.
> AI agents MUST read `AGENTS.md` and `docs/` before writing any code.

## Highlights

- 🇮🇷 Fully Persian & RTL, self-hosted assets (works inside Iran without VPN)
- 🎨 4 curated visual themes, rich-but-smooth animations (Motion)
- 🧱 Strict Clean Architecture (domain / application / infrastructure) with DI
- 🔐 Custom lightweight auth (argon2id + HTTP-only session cookie)
- 🖼️ Client-side crop/rotate upload with server-side optimization (Sharp)
- 📱 Live "phone frame" preview of unsaved changes inside the admin panel
- 🌱 Fully offline deterministic seed (branded SVG placeholders, ADR-10)

## Tech Stack (summary)

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · shadcn/ui ·
Motion (`motion/react`) · Prisma · PostgreSQL · Zod · React Hook Form · dnd-kit ·
react-easy-crop · zustand · sonner · @node-rs/argon2 · jose · Sharp ·
Vitest · Playwright · Docker · Caddy

Full rationale + pinned versions: [`docs/02-tech-stack.md`](docs/02-tech-stack.md)

## Quick Start (development)

Prerequisites: Node 22 LTS, pnpm 10, Docker.

```bash
pnpm install
cp .env.example .env          # fill DATABASE_URL, SESSION_SECRET, ADMIN_*
docker compose up -d db       # PostgreSQL 16 (dev, port 5432)
docker compose --profile test up -d db-test  # E2E Postgres (port 5433)
pnpm db:migrate               # prisma migrate dev
pnpm db:seed                  # settings singleton (M0); full menu + placeholders in M3
pnpm dev                      # http://localhost:3000
pnpm build                    # once, before Playwright (`pnpm start` serves standalone)
pnpm test:e2e                 # Playwright against the test DB (doc 09)
```

Admin panel: `http://localhost:3000/admin` (credentials from `.env`).

## Scripts

| Command            | Description                                    |
| ------------------ | ---------------------------------------------- |
| `pnpm dev`         | Dev server                                     |
| `pnpm build`       | Production build                               |
| `pnpm start`       | Start production server                        |
| `pnpm lint`        | ESLint (flat config, strict)                   |
| `pnpm typecheck`   | `tsc --noEmit`                                 |
| `pnpm test`        | Vitest unit tests (single run)                 |
| `pnpm test:watch`  | Vitest watch mode (TDD loop)                   |
| `pnpm test:e2e`    | Playwright E2E (test DB on 5433; requires `pnpm build` + `db-test`) |
| `pnpm db:migrate`  | Prisma migrate dev                             |
| `pnpm db:deploy`   | Prisma migrate deploy (used by E2E global-setup) |
| `pnpm db:seed`     | Seed database (settings singleton in M0; full Delepe menu & placeholders in M3) |
| `pnpm admin:reset` | CLI: create/reset an admin user (recovery)     |
| `pnpm check`       | lint + typecheck + test + build (pre-commit)   |

## Repository Structure

```text
docs/               planning & specification documents (English)
prisma/             schema, migrations, seed
scripts/            CLI tools (admin:reset)
e2e/                Playwright specs
src/app             Next.js routes (thin composition layer)
src/components      ui/ (shadcn) · menu/ (presentational) · admin/
src/domain          entities, domain errors, repository ports, testing fakes
src/application     use-cases, DTOs, Zod schemas, pure mappers
src/infrastructure  Prisma repositories, storage, auth adapters, DI container
src/lib             env config, constants, price formatting, Persian strings, utils
```

## Documentation Index

| Document | Purpose |
| --- | --- |
| [01-product-overview](docs/01-product-overview.md) | Vision, scope, users, glossary |
| [02-tech-stack](docs/02-tech-stack.md) | Pinned stack + rejected alternatives (ADRs) |
| [03-architecture](docs/03-architecture.md) | Clean Architecture, folder tree, DI, data flow, **media pipeline** |
| [04-data-model](docs/04-data-model.md) | Prisma schema, business rules (BR-01..16), DTOs, use-case contracts, seed data |
| [05-design-system](docs/05-design-system.md) | Complete tokens ×4 themes, typography, RTL, motion tokens |
| [06-public-menu-spec](docs/06-public-menu-spec.md) | Customer-facing menu behavior + animation catalog + acceptance criteria |
| [07-admin-panel-spec](docs/07-admin-panel-spec.md) | Admin CRUD, draft store rules, upload editor, live phone preview |
| [08-clean-code-standards](docs/08-clean-code-standards.md) | SOLID mapping, naming, error handling rules |
| [09-testing](docs/09-testing.md) | Local-first TDD workflow + unit/E2E + CI |
| [10-security](docs/10-security.md) | Auth, rate limiting, upload security, headers, recovery policy |
| [11-performance-accessibility](docs/11-performance-accessibility.md) | Budgets, image pipeline, a11y, reduced motion |
| [12-deployment](docs/12-deployment.md) | Docker Compose, Caddy/SSL, VPS runbook, backups |
| [13-implementation-plan](docs/13-implementation-plan.md) | Task tree + dependency graph + milestones + DoD |
| [14-agent-prompts](docs/14-agent-prompts.md) | Ready-to-use coding-agent prompt per milestone |

## Font Licensing Note

Body font **IRANSans** is a commercial font. The owner must place licensed
`woff2` files (400/500/700) in `src/fonts/iransans/`. The build falls back to the
open-source **Vazirmatn** if the files are missing. Heading font **Markazi Text**
is OFL.
