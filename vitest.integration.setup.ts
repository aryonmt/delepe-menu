/**
 * Env for Prisma integration specs. Sets DATABASE_URL to the E2E test database
 * before any module (including `lib/env`) is imported.
 */
try {
  process.loadEnvFile?.(".env");
} catch {
  // optional
}

Object.assign(process.env, { NODE_ENV: "test" });
process.env.DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://delepe:delepe@localhost:5433/delepe_test";
process.env.SESSION_SECRET ??= "vitest-session-secret-32-bytes-min!!";
