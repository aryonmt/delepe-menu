# 10 · Security

## Credentials & sessions

- Hash: **argon2id** via `@node-rs/argon2` (m=19456, t=2, p=1).
- Session: JWT HS256 (`jose`), payload `{ sub, iat }`, 7 days;
  cookie `delepe_session`: HttpOnly, SameSite=Lax, Secure in production, Path=/admin+api/admin.
- `SESSION_SECRET` ≥ 32 bytes from env; rotation = restart + logout-all (acceptable).
- Every server action & route re-verifies the session (middleware is defense-in-depth only).

## Login hardening

- Generic Persian failure: «نام کاربری یا رمز عبور نادرست است».
- Rate limit: 5 attempts / 15 min per (ip+username), in-memory store
  (single instance deployment; documented limitation).
- Small constant delay (300ms) on failure to slow brute force.

## Developer recovery (owner forgot password)

Two mechanisms, both audited:
1. `pnpm admin:reset --username X --password Y` (scripts/, server-side, argon2).
2. Optional env `MASTER_USERNAME`/`MASTER_PASSWORD`: accepted by LoginCommand
   **only when both are set**; every master login writes a warning log line.
   Documented as a recovery backdoor; remove from `.env` when not needed.

## Upload & media

- Magic-byte sniff (jpeg/png/webp), size ≤5MB, ratio 4:3 ±2%.
- Files stored under `STORAGE_ROOT` **outside** web root, names `cuid().ext`.
- Served only via `/media/[mediaId]` (auth not required; unguessable ids).
- Sharp re-encodes (strips EXIF/metadata); originals never served to public.

## Web hardening

- Headers (middleware + Caddy): `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (admin),
  `Strict-Transport-Security` when TLS, CSP report-only baseline:
  `default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline';
  script-src 'self'; font-src 'self'`.
- CSRF: server-action wrapper asserts `Origin` same-origin; upload route same.
- SQLi: Prisma parameterized queries only. XSS: React escaping; **no**
  `dangerouslySetInnerHTML` anywhere (lint rule).
- Admin HTML: `Cache-Control: no-store`.

## Secrets & supply chain

- `.env.example` committed; real `.env` gitignored; no secrets in images (runtime env).
- `pnpm audit --audit-level=high` in CI (advisory); lockfile committed;
  new deps require doc 02 update (AGENTS rule).