/** Playwright / CI database URL. No Next or Prisma imports. */
export function e2eDatabaseUrl(): string {
  return (
    process.env.E2E_DATABASE_URL ??
    "postgresql://delepe:delepe@localhost:5433/delepe_test"
  );
}
