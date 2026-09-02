# 02 · Tech Stack & ADRs

## Stack (pinned)

Exact patch versions are locked in `package.json` / lockfile; this table pins the
**major/minor line** — do not upgrade a line without updating this doc.

| Area | Choice | Version | Why |
| --- | --- | --- | --- |
| Framework | Next.js App Router | 15.5.x | RSC for fast SSR menu, server actions, simple self-host (`output: standalone`) |
| Language | TypeScript (strict) | 5.9.x | Clean code, refactor safety, AI-friendly |
| UI runtime | React | 19.1.x | Ships with Next 15.5 |
| Styling | Tailwind CSS + CSS variables | 3.4.x | Theme system via variables, RTL-friendly, AI-friendly |
| Components | shadcn/ui (Radix) | CLI latest at init | Accessible primitives, full visual control, copy-in ownership |
| shadcn Slot | `@radix-ui/react-slot` | 1.2.x | `asChild` composition for shadcn Button |
| Class variants | `class-variance-authority` | 0.7.x | shadcn `cva()` variant maps (Button) |
| Classnames | `clsx` | 2.x | Conditional `className` lists (`lib/utils` `cn`) |
| Tailwind merge | `tailwind-merge` | 2.x | Resolves conflicting Tailwind classes in `cn` |
| Motion | **Motion** (formerly Framer Motion) | 12.x | Layout animations, springs, reduced-motion support. Package `motion`, imports from `motion/react` |
| Client state | zustand | 5.x | Admin draft store (live preview backbone, doc 07) |
| DnD | @dnd-kit/core + @dnd-kit/sortable | 6.x | Accessible drag-and-drop for ordering |
| Forms | React Hook Form + @hookform/resolvers + Zod | RHF 7.x · resolvers 5.x · zod 4.x | Typed validation, Persian messages |
| Crop | react-easy-crop | 5.x | Client crop/rotate with 4:3 lock |
| ORM | Prisma | 6.x | Type-safe, migrations, AI-friendly |
| DB | PostgreSQL | 16 | Relational integrity, enum arrays, Docker-friendly |
| Auth hashing | @node-rs/argon2 | 2.x | argon2id, prebuilt binaries (no node-gyp in Docker) |
| Session | jose (JWT HS256, HTTP-only cookie) | 6.x | Stateless, small, edge-compatible (middleware), auditable |
| Images | Sharp | 0.34.x | Server-side resize/WebP + dominant color stats |
| Toasts | sonner | 2.x | RTL-friendly, beautiful |
| Icons | lucide-react | 0.5xx | Consistent stroke icons. **Only main package** — no @lucide/lab |
| Unit tests | Vitest | 3.x | Fast, TS-native, colocated `*.test.ts` |
| E2E tests | Playwright | 1.5x | Critical E2E flows |
| A11y tests | @axe-core/playwright | 4.x | axe scans in E2E |
| Bundle analysis | @next/bundle-analyzer | 15.x | CI guard: admin libs out of public bundle |
| Lint/Format | ESLint flat + Prettier | 9.x / 3.x | Strict ruleset |
| CLI runner (TS scripts) | tsx | 4.x | runs seed and admin-reset as TypeScript without a build step |
| Runtime | Node 22 LTS, pnpm 10 | | Node 20 is EOL; 22 is the active LTS |
| Deploy | Docker Compose + Caddy 2 | | Auto-TLS, single VPS, Iran-accessible |

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
  Media variants are **pre-generated at upload** (320/640/960 WebP), never on-demand:
  deterministic CPU cost, immutable caching, no Sharp work on the request path.
- **ADR-05 Strict Clean Architecture** (per owner decision): domain ports +
  use-case classes + lightweight manual DI container. No DI framework.
- **ADR-06 Tailwind v3.4 (not v4)**: shadcn tooling + AI familiarity stability.
- **ADR-07 Fonts**: body IRANSans (owner-provided woff2 400/500/700, self-hosted)
  with Vazirmatn fallback; headings Markazi Text (OFL) via `next/font` (downloaded
  at build, self-hosted at runtime). No runtime requests to Google Fonts.
- **ADR-08 No runtime external services** (no CDN, no Cloudinary, no Google Maps):
  guarantees access with/without VPN.
- **ADR-09 Motion v12 (`motion` package)** instead of `framer-motion` v11:
  the library was renamed; v12 is the maintained line. All imports use
  `motion/react`. Do not install `framer-motion`.
- **ADR-10 Deterministic seed images**: seed generates branded SVG placeholders
  (theme-colored gradient + category glyph + product initial) by default — fully
  offline, byte-stable, zero network dependency. Optional `SEED_DOWNLOAD_IMAGES=true`
  downloads curated photos per `imageKeyword` (doc 04) with SVG fallback on failure.
  Rejected: always-download (non-hermetic seed, breaks offline/E2E).
- **ADR-11 zustand for the admin draft store**: tiny, no provider boilerplate,
  works outside React render for `beforeunload` guards. Rejected: Redux Toolkit
  (overkill), Context (re-render churn on every keystroke).

## Dependency policy

Every runtime/dev dependency must appear in this table. Adding one without updating
this doc in the same commit is a hard-rule violation (AGENTS.md).
