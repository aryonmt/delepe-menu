# 02 · Tech Stack & ADRs

## Stack

| Area | Choice | Version | Why |
| --- | --- | --- | --- |
| Framework | Next.js App Router | 15.x | RSC for fast SSR menu, server actions, simple self-host (`output: standalone`) |
| Language | TypeScript (strict) | 5.x | Clean code, refactor safety, AI-friendly |
| Styling | Tailwind CSS + CSS variables | 3.4 | Theme system via variables, RTL-friendly, AI-friendly |
| Components | shadcn/ui (Radix) | latest | Accessible primitives, full visual control, copy-in ownership |
| Motion | Framer Motion | 11/12 | Layout animations, springs, scrollspy helpers, reduced-motion support |
| DnD | @dnd-kit/core + sortable | latest | Accessible drag-and-drop for ordering |
| Forms | React Hook Form + Zod | latest | Typed validation, Persian messages |
| Crop | react-easy-crop | latest | Client crop/rotate with 4:3 lock |
| ORM | Prisma | 6.x | Type-safe, migrations, AI-friendly |
| DB | PostgreSQL | 16 | Relational integrity, enum arrays, Docker-friendly |
| Auth hashing | @node-rs/argon2 | latest | argon2id, prebuilt binaries (no node-gyp in Docker) |
| Session | jose (JWT HS256, HTTP-only cookie) | latest | Stateless, small, auditable |
| Images | Sharp | latest | Server-side resize/WebP optimization |
| Toasts | sonner | latest | RTL-friendly, beautiful |
| Icons | lucide-react | latest | Consistent stroke icons |
| Testing | Playwright | latest | Critical E2E flows |
| Lint/Format | ESLint flat + Prettier | latest | Strict ruleset |
| Runtime | Node 20 LTS, pnpm 9 | | Stability |
| Deploy | Docker Compose + Caddy | | Auto-TLS, single VPS, Iran-accessible |

## ADRs (key decisions)

- **ADR-01 Single Next.js full-stack app** (no separate API service).
  Mutations via server actions; one upload route handler (needs XHR progress).
  Rejected: NestJS (overkill), Vite SPA (no SSR, worse first paint).
- **ADR-02 PostgreSQL over SQLite**: relational guards (delete rules, ordering),
  enum arrays for badges, professional portfolio signal. SQLite rejected (file locks
  in Docker, weaker portfolio signal).
- **ADR-03 Custom lightweight auth** instead of Auth.js/better-auth: single role,
  username (not email), full control, easier to audit and test; strict security
  checklist in `docs/10`.
- **ADR-04 Local disk storage + Sharp** (no external image SaaS): runtime must work
  inside Iran with zero blocked dependencies; Docker volume persists uploads.
- **ADR-05 Strict Clean Architecture** (per owner decision): domain ports +
  use-case classes + lightweight manual DI container. No DI framework.
- **ADR-06 Tailwind v3.4 (not v4)**: shadcn tooling + AI familiarity stability.
- **ADR-07 Fonts**: body IRANSans (owner-provided woff2, self-hosted) with Vazirmatn
  fallback; headings Markazi Text (OFL) via `next/font` (downloaded at build,
  self-hosted at runtime). No runtime requests to Google Fonts.
- **ADR-08 No runtime external services** (no CDN, no Cloudinary, no Google Maps):
  guarantees access with/without VPN.