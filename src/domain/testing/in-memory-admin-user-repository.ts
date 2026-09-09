import type { AdminUser } from "../entities";
import type { AdminUserRepository } from "../ports";

export class InMemoryAdminUserRepository implements AdminUserRepository {
  private readonly users = new Map<string, AdminUser>();
  private seq = 0;

  async findById(id: string): Promise<AdminUser | null> {
    const row = this.users.get(id);
    return row ? { ...row } : null;
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    const row = [...this.users.values()].find((user) => user.username === username);
    return row ? { ...row } : null;
  }

  async findFirst(): Promise<AdminUser | null> {
    const row = [...this.users.values()][0];
    return row ? { ...row } : null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error(`AdminUser ${id} missing`);
    }
    this.users.set(id, { ...existing, passwordHash });
  }

  async upsertByUsername(
    username: string,
    passwordHash: string,
  ): Promise<AdminUser> {
    const existing = await this.findByUsername(username);
    if (existing) {
      const updated = { ...existing, passwordHash };
      this.users.set(existing.id, updated);
      return { ...updated };
    }
    this.seq += 1;
    const created: AdminUser = {
      id: `admin_${this.seq}`,
      username,
      passwordHash,
    };
    this.users.set(created.id, created);
    return { ...created };
  }
}
