/**
 * Dummy env so unit tests can import `@/lib/env` without a Zod boot failure.
 * `.env` is loaded when present; CI / fresh clones fall back to safe defaults.
 */
try {
  process.loadEnvFile?.(".env");
} catch {
  // File missing — use the fallbacks below.
}

// NODE_ENV is typed read-only on process.env; Object.assign avoids TS2540.
Object.assign(process.env, { NODE_ENV: "test" });
process.env.DATABASE_URL ??=
  "postgresql://delepe:delepe@localhost:5432/delepe_test";
process.env.SESSION_SECRET ??= "vitest-session-secret-32-bytes-min!!";
