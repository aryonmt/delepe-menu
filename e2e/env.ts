import path from "node:path";

/** Playwright / CI database URL. No Next or Prisma imports. */
export function e2eDatabaseUrl(): string {
  return (
    process.env.E2E_DATABASE_URL ??
    "postgresql://delepe:delepe@localhost:5433/delepe_test"
  );
}

/** Repo-local uploads dir so seed and the standalone server share the same files. */
export function e2eStorageRoot(): string {
  return path.resolve("./storage");
}
