import { changePasswordSchema } from "@/application/schemas";
import { parseOrThrow } from "@/application/use-cases/shared/parse";
import { UnauthorizedError, ValidationError } from "@/domain/errors";
import type { AdminUserRepository, PasswordHasher } from "@/domain/ports";

/**
 * Replaces the stored argon2id hash after verifying the current password
 * and a matching confirmation (docs/07, docs/10). Other JWTs stay valid.
 */
export class ChangePasswordUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: unknown): Promise<void> {
    const data = parseOrThrow(changePasswordSchema, input);
    if (data.next !== data.confirm) {
      throw new ValidationError("PASSWORD_MISMATCH");
    }
    const user = await this.users.findById(data.adminId);
    if (!user) {
      throw new UnauthorizedError();
    }
    const matches = await this.hasher.verify(user.passwordHash, data.current);
    if (!matches) {
      throw new ValidationError("INVALID_CREDENTIALS");
    }
    const nextHash = await this.hasher.hash(data.next);
    await this.users.updatePasswordHash(user.id, nextHash);
  }
}
