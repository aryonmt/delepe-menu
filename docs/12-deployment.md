# 12 · Deployment & Operations

## Topology

Single VPS (any country; no runtime dependency on blocked services).
`Caddy → app (Next standalone :3000) + PostgreSQL 16`.
Works with a domain (auto-TLS) or bare IP (HTTP) until a domain is bought.

## Environment variables

| Var | Required | Purpose |
| --- | --- | --- |
| DATABASE_URL | yes | postgres connection |
| SESSION_SECRET | yes | ≥32B random |
| ADMIN_USERNAME / ADMIN_PASSWORD | first boot | seeds initial admin (ignored after user exists) |
| MASTER_USERNAME / MASTER_PASSWORD | no | recovery backdoor (doc 10) |
| STORAGE_ROOT | no | default `/data/storage` |
| PORT | no | 3000 |

## docker compose (production)

Services:
- `db`: postgres:16-alpine, volume `pgdata`, healthcheck `pg_isready`.
- `app`: build `Dockerfile`, env above, volume `storage:/data/storage`,
  depends_on db healthy, restart always, entrypoint runs
  `prisma migrate deploy` then `node server.js`.
- `caddy`: caddy:2-alpine, ports 80/443, volume `Caddyfile` + `caddy_data`,
  reverse_proxy `:443 → app:3000` (with domain) or `:80` passthrough.

Dockerfile (multi-stage, node:20-bookworm-slim, corepack pnpm):
`deps → build (output: standalone) → runner` (non-root user, copies
`.next/standalone`, `public`, `prisma`, storage entrypoint).

## VPS runbook (condensed)

1. Ubuntu 24.04, `ufw` allow 22/80/443, create deploy user, SSH keys.
2. Install Docker + compose plugin.
3. `git clone` → `cp .env.example .env` → fill secrets.
4. `docker compose up -d --build`.
5. Point domain → Caddy obtains TLS automatically.
6. Verify `/api/health` = `{ ok: true, db: true }`.

## Backups & restore

- Daily cron on host: `docker exec db pg_dump -Fc delepe > /backups/db-$(date).dump`
  + `tar czf /backups/storage-*.tgz storage volume`; retention 14 days;
  optional off-site copy (any S3 the owner trusts).
- Restore: `pg_restore` into fresh volume + extract storage; documented commands.

## Updates

`git pull && docker compose up -d --build` (downtime < 10s; acceptable for v1).
Healthcheck + `restart: always` for self-healing. Logs: `docker compose logs`
(JSON stdout; rotation via docker log-opts).