import type { PrismaClient } from "@prisma/client";
import type { AdminUser } from "@/domain/entities";
import type { AdminUserRepository } from "@/domain/ports";

export class PrismaAdminUserRepository implements AdminUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<AdminUser | null> {
    const row = await this.prisma.adminUser.findUnique({ where: { id } });
    return row ? toAdminUser(row) : null;
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    const row = await this.prisma.adminUser.findUnique({ where: { username } });
    return row ? toAdminUser(row) : null;
  }

  async findFirst(): Promise<AdminUser | null> {
    const row = await this.prisma.adminUser.findFirst({ orderBy: { createdAt: "asc" } });
    return row ? toAdminUser(row) : null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async upsertByUsername(
    username: string,
    passwordHash: string,
  ): Promise<AdminUser> {
    const row = await this.prisma.adminUser.upsert({
      where: { username },
      create: { username, passwordHash },
      update: { passwordHash },
    });
    return toAdminUser(row);
  }
}

function toAdminUser(row: {
  id: string;
  username: string;
  passwordHash: string;
}): AdminUser {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.passwordHash,
  };
}
