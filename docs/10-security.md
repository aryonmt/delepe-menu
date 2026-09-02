# 10 · Security

## Credentials & sessions

- Hash: **argon2id** via `@node-rs/argon2` (m=19456, t=2, p=1).
- Session: JWT HS256 (`jose`), payload `{ sub: <AdminUser.id>, iat, exp }`,
  `exp = iat + 7 days`; cookie `delepe_session`: HttpOnly, SameSite=Lax,
  **Path=/** (single valid path — required so `/api/admin/**` routes receive it),
  Secure in production.
- `SESSION_SECRET` ≥ 32 bytes from env; rotation = restart + logout-all (acceptable).
- Middleware (edge, jose only) guards `/admin/**` + `/api/admin/**` as
  defense-in-depth; **every** server action & route handler re-verifies the
  session via `VerifySessionUseCase`.
- Password change does **not** invalidate other sessions (stateless JWT, single
  admin — accepted for v1; revisit if roles are ever added).

## Login hardening

- Generic Persian failure: «نام کاربری یا رمز عبور نادرست است».
- Rate limit: 5 attempts / 15 min per (ip+username), in-memory store
  (single instance deployment; documented limitation).
- 6th attempt → `ActionResult { ok:false, error:{ code: "RATE_LIMITED",
  fa: "تعداد تلاش‌ها بیش از حد مجاز است؛ ۱۵ دقیقه دیگر تلاش کنید" } }`
  (asserted verbatim in `auth.spec`, doc 09).
- Small constant delay (300ms) on failure to slow brute force.

## Developer recovery (owner forgot password)

Two mechanisms, both audited:
1. `pnpm admin:reset --username X --password Y` (scripts/, server-side, argon2).
2. Optional env `MASTER_USERNAME`/`MASTER_PASSWORD`: accepted by the login
   use-case **only when both are set**; every master login writes a warning log
   line. Documented as a recovery backdoor; remove from `.env` when not needed.

## Upload & media

- Magic-byte sniff (jpeg/png/webp), size ≤ 5MB, ratio 4:3 ±2% (BR-11).
- Files stored under `STORAGE_ROOT` **outside** the web root, names `cuid().ext`
  (unique per upload; variants `{id}_{320|640|960}.webp`, doc 03).
- Served only via `/media/[mediaId]?w=` (public; unguessable ids; originals never
  served — only pre-generated WebP variants).
- Sharp re-encodes (strips EXIF/metadata).

## Web hardening

- Headers (middleware + Caddy): `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (admin),
  `Strict-Transport-Security` when TLS.
- CSP ships **report-only** in v1:
  `default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline';
  script-src 'self' 'unsafe-inline'; font-src 'self'`.
  (`'unsafe-inline'` for script/style is required by Next.js inline hydration and
  Motion inline styles. Enforcing a nonce-based CSP is a post-v1 task — do not
  enforce in v1.)
- CSRF: the server-action wrapper asserts same-origin `Origin`; upload route same.
- SQLi: Prisma parameterized queries only. XSS: React escaping; **no**
  `dangerouslySetInnerHTML` anywhere (lint rule).
- Admin HTML: `Cache-Control: no-store`.

## Secrets & supply chain

- `.env.example` committed; real `.env` gitignored; no secrets in images (runtime env).
- `pnpm audit --audit-level=high` in CI (advisory); lockfile committed;
  new deps require a doc 02 update in the same commit (AGENTS rule).
