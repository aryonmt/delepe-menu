# Delepe Menu

A visually rich, mobile-first **digital QR menu** for **Delepe Café Restaurant**, with a
Persian admin panel for the owner.

- Customers scan a QR code and browse the menu on their phone. **No digital ordering** — ordering stays traditional.
- The owner manages categories, products, prices, images, availability, discounts and settings.

> Planning documents live in `docs/`. Coding agents must read `AGENTS.md` first.

## Highlights

- Fully Persian & RTL, self-hosted assets (works inside Iran without VPN)
- Single art-directed «پاتوق» identity (dark cinematic hangout)
- Clean Architecture (domain / application / infrastructure)
- Custom auth (argon2id + HTTP-only session cookie)
- Client crop/rotate upload with Sharp variants
- Live phone-frame preview of unsaved admin changes
- Offline deterministic seed (branded SVG placeholders)

## Tech stack (summary)

Next.js 15 (App Router, standalone) · React 19 · TypeScript · Tailwind CSS ·
Motion (`motion/react`) · Prisma · PostgreSQL 16 · Zod · React Hook Form ·
dnd-kit · react-easy-crop · zustand · sonner · argon2 · jose · Sharp ·
Vitest · Playwright · Docker Compose · Caddy 2

Pinned versions: [`docs/02-tech-stack.md`](docs/02-tech-stack.md)

## Quick start (development)

Prerequisites: Node 22 LTS, pnpm 10, Docker.

```bash
pnpm install
cp .env.example .env          # fill SESSION_SECRET, ADMIN_* (keep DATABASE_URL for localhost)
docker compose up -d db       # PostgreSQL 16 on 127.0.0.1:5432
docker compose --profile test up -d db-test  # E2E Postgres on 5433
pnpm db:migrate
pnpm db:seed
pnpm dev                      # http://localhost:3000
```

Admin: `http://localhost:3000/admin` (credentials from `.env`).
Default seed login is `admin` / `change-me-now` until you change it.

## Production (VPS)

See [`docs/12-deployment.md`](docs/12-deployment.md) for the full runbook.

```bash
cp .env.example .env          # set SESSION_SECRET and ADMIN_* 
docker compose up -d --build
docker compose exec app pnpm db:seed
curl -sf http://127.0.0.1/api/health
# {"ok":true,"db":true}
```

Daily backups: `scripts/backup.sh`. Restore: `scripts/restore.sh <dump> <storage.tgz>`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server (prints LAN URL for phone testing) |
| `pnpm build` | Production build (`output: standalone`) |
| `pnpm start` | Serve standalone build |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright on port 3100 (needs `db-test`) |
| `pnpm test:integration` | Prisma specs against `db-test` |
| `pnpm check:bundle` | Fail if dnd-kit / react-easy-crop leak into the public bundle |
| `pnpm db:migrate` / `pnpm db:deploy` / `pnpm db:seed` | Prisma |
| `pnpm admin:reset` | Create or reset an admin (recovery) |
| `pnpm check` | lint + typecheck + unit + build + bundle check |

## Repository layout

```text
docs/               specifications (English)
prisma/             schema, migrations, seed
scripts/            admin:reset, backup/restore, Docker entrypoint, CI helpers
e2e/                Playwright specs
.github/workflows   `quality` CI job
src/app             Next.js routes (thin)
src/components      ui/ · menu/ · admin/ · brand/
src/domain          entities, errors, ports, fakes
src/application     use-cases, DTOs, Zod, mappers
src/infrastructure  Prisma, storage, auth, DI
src/lib             env, tokens, strings, formatting
```

## Documentation index

| Document | Purpose |
| --- | --- |
| [01-product-overview](docs/01-product-overview.md) | Vision, scope, users |
| [02-tech-stack](docs/02-tech-stack.md) | Pinned stack + ADRs |
| [03-architecture](docs/03-architecture.md) | Layers, DI, media pipeline |
| [04-data-model](docs/04-data-model.md) | Prisma, BR-01..16, seed |
| [05-design-system](docs/05-design-system.md) | «پاتوق» tokens |
| [06-public-menu-spec](docs/06-public-menu-spec.md) | Public menu + motion |
| [07-admin-panel-spec](docs/07-admin-panel-spec.md) | Admin CRUD + preview |
| [08-clean-code-standards](docs/08-clean-code-standards.md) | SOLID, naming, errors |
| [09-testing](docs/09-testing.md) | TDD, unit, E2E, CI |
| [10-security](docs/10-security.md) | Auth, headers, recovery |
| [11-performance-accessibility](docs/11-performance-accessibility.md) | Budgets, a11y |
| [12-deployment](docs/12-deployment.md) | Docker, Caddy, backups |
| [13-implementation-plan](docs/13-implementation-plan.md) | Milestones |
| [14-agent-prompts](docs/14-agent-prompts.md) | Agent prompts per milestone |
| [15-m7-visual-qa](docs/15-m7-visual-qa.md) | Identity contrast QA |

## Font licensing

Body font **IRANSans** is commercial. Place licensed `woff2` files (400/500/700)
in `src/fonts/iransans/`. The build falls back to **Vazirmatn** if they are
missing. Display font **Lalezar** is OFL.
