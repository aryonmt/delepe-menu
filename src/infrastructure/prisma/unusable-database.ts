/** Prisma codes that mean "no usable schema/connection" (CI/image build). */
const UNUSABLE_DB_CODES = new Set(["P2021", "P1001", "P1000", "P1017"]);

export function isUnusableDatabase(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const record = error as {
    code?: unknown;
    errorCode?: unknown;
    name?: unknown;
    message?: unknown;
  };
  const code = record.code ?? record.errorCode;
  if (code != null && UNUSABLE_DB_CODES.has(String(code))) {
    return true;
  }
  if (record.name !== "PrismaClientInitializationError") {
    return false;
  }
  const message = String(record.message ?? "");
  return /Can't reach database server|ECONNREFUSED|P1001/i.test(message);
}
