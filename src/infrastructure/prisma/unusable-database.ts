/** Prisma codes that mean "no usable schema/connection" (CI/image build). */
const UNUSABLE_DB_CODES = new Set(["P2021", "P1001", "P1000", "P1017"]);

export function isUnusableDatabase(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  return UNUSABLE_DB_CODES.has(String((error as { code: unknown }).code));
}
