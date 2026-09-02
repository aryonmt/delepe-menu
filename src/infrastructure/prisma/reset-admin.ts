import { Argon2PasswordHasher } from "@/infrastructure/auth/password";
import { prisma } from "@/infrastructure/prisma/client";
import { PrismaAdminUserRepository } from "@/infrastructure/prisma/repositories/admin-user-repository";

/** Creates or replaces the admin row. Prisma stays inside this module. */
export async function resetAdminUser(
  username: string,
  password: string,
): Promise<void> {
  const hasher = new Argon2PasswordHasher();
  const users = new PrismaAdminUserRepository(prisma);
  const passwordHash = await hasher.hash(password);
  await users.upsertByUsername(username, passwordHash);
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
