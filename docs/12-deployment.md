# 12 · Deployment & Operations

## Topology

Single VPS (any country; no runtime dependency on blocked services).
`Caddy → app (Next standalone :3000) + PostgreSQL 16`.
Works with a domain (auto-TLS) or bare IP (HTTP) until a domain is bought.

## Environment variables

| Var | Required | Purpose |
| --- | --- | --- |
| DATABASE_URL | yes | postgres connection (Compose **app** overrides to `db:5432`) |
| SESSION_SECRET | yes | ≥32B random |
| ADMIN_USERNAME / ADMIN_PASSWORD | first seed | initial admin — used only when `AdminUser` count = 0 (doc 04) |
| MASTER_USERNAME / MASTER_PASSWORD | no | recovery backdoor (doc 10) |
| SEED_DOWNLOAD_IMAGES | no | `true` = seed tries curated photo download, SVG fallback (ADR-10) |
| STORAGE_ROOT | no | default `/data/storage` |
| PORT | no | 3000 |
| POSTGRES_PASSWORD | no | Compose db password; default `delepe` |
| POSTGRES_PUBLISH_PORT | no | host bind for Postgres; default `5432` on `127.0.0.1` only |
| CADDY_SITE | no | Caddy site address; default `http://:80`. Set a hostname for auto-TLS |
| E2E_DATABASE_URL | no | Playwright / CI; default `localhost:5433/delepe_test` |
| E2E_PORT | no | Playwright webServer port; default `3100` |

## docker compose (production)

Services:
- `db`: postgres:16-alpine, volume `delepe_pgdata`, healthcheck `pg_isready`,
  published only on loopback.
- `app`: build `Dockerfile`, env above, volume `delepe_storage:/data/storage`,
  depends_on db healthy, restart always, entrypoint runs
  `prisma migrate deploy` then `node server.js`.
- `caddy`: caddy:2-alpine, ports 80/443, `Caddyfile` + `delepe_caddy_data`,
  reverse_proxy to `app:3000`. `CADDY_SITE` selects HTTP `:80` or a hostname
  (auto-TLS). Security headers from docs/10 (HSTS only on HTTPS).

Local development starts **only** the database: `docker compose up -d db`.

Compose also defines a **`test` profile** for E2E (doc 09):
- `db-test`: postgres:16-alpine, host port **5433**, db `delepe_test`,
  throwaway volume. Playwright global-setup runs `prisma migrate deploy` and
  `admin-reset` against it (`E2E_DATABASE_URL`, default
  `postgresql://delepe:delepe@localhost:5433/delepe_test`).

Caddy must be the only trusted proxy and overwrites `X-Forwarded-For` by
default; never expose the app behind a proxy that forwards client-supplied XFF
unchecked (login rate limiting keys on it, doc 10).

Dockerfile (multi-stage, node:22-bookworm-slim, corepack pnpm):
`deps → build (output: standalone) → runner` (non-root user, copies
`.next/standalone`, `public`, `prisma`, `src` for seed, storage entrypoint).
The **build** stage uses a placeholder `DATABASE_URL` (no live DB). Public `/`
is dynamic RSC plus tagged menu cache, so image build does not require
`Settings`. Runtime Compose supplies the real `DATABASE_URL`; entrypoint
migrates, then seed fills the menu.
`.dockerignore` omits `e2e/` and Playwright/Vitest configs; `tsconfig.json`
excludes them so `next build` inside the image does not typecheck test files.

## VPS runbook (condensed)

1. Ubuntu 24.04, `ufw` allow 22/80/443, create deploy user, SSH keys.
2. Install Docker + compose plugin.
3. `git clone` → `cp .env.example .env` → fill secrets (SESSION_SECRET,
   ADMIN_USERNAME, ADMIN_PASSWORD). Leave DATABASE_URL as localhost; Compose
   overrides it for the `app` service.
4. `docker compose up -d --build`.
5. **Seed once**: `docker compose exec app pnpm db:seed`
   (creates settings, category tree, full menu, and the initial admin when none
   exists; safe to re-run — idempotent, never resets an existing admin).
6. Point domain → set `CADDY_SITE=your.domain` in `.env` →
   `docker compose up -d caddy` — Caddy obtains TLS automatically.
7. Verify `/api/health` = `{ ok: true, db: true }` and `/` shows the seeded menu.

Timed fresh-clone drill (T-084): the steps above on a clean VPS (or a clean
local Docker daemon) must reach a healthy seeded `/api/health` in under 15
minutes. Record start/end wall-clock on the first production install.

## Backups & restore

Daily cron on the VPS (03:15 example):

```cron
15 3 * * * /opt/delepe-menu/scripts/backup.sh
```

`scripts/backup.sh` writes `/backups/db-YYYYmmdd-HHMMSS.dump` (`pg_dump -Fc`)
and `/backups/storage-*.tgz` (volume `delepe_storage`). Retention 14 days.
Override with `BACKUP_DIR` / `RETENTION_DAYS`. Optional off-site copy of
`/backups` (any S3 the owner trusts).

### Restore drill

On a stack that is already `docker compose up`:

```bash
# 1. Take a backup
sudo mkdir -p /backups && sudo chown "$USER" /backups
BACKUP_DIR=/backups ./scripts/backup.sh

# 2. Restore that backup (app restarts)
./scripts/restore.sh /backups/db-TIMESTAMP.dump /backups/storage-TIMESTAMP.tgz

# 3. Confirm
curl -sf http://127.0.0.1/api/health
# expect {"ok":true,"db":true}
```

Pass = health JSON ok and the public menu still shows seeded (or owner) items
and images.

## Updates

`git pull && docker compose up -d --build` (downtime < 10s; acceptable for v1).
Healthcheck + `restart: always` for self-healing. Logs: `docker compose logs`
(JSON stdout; rotation via compose `json-file` log-opts).
