import { z } from "zod";
import { changePasswordSchema } from "@/application/schemas";
import { parseOrThrow } from "@/application/use-cases/shared/parse";
import { UnauthorizedError, ValidationError } from "@/domain/errors";
import type { AdminUserRepository, PasswordHasher } from "@/domain/ports";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/constants";

const envelopeSchema = z.object({
  adminId: z.string().min(1),
  current: z.string(),
  next: z.string(),
  confirm: z.string(),
});

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
    const raw = parseOrThrow(envelopeSchema, input);
    if (
      raw.next.length < PASSWORD_MIN_LENGTH ||
      raw.next.length > PASSWORD_MAX_LENGTH
    ) {
      throw new ValidationError("NEW_PASSWORD_INVALID");
    }
    if (raw.next !== raw.confirm) {
      throw new ValidationError("PASSWORD_MISMATCH");
    }
    if (raw.current.length < 1 || raw.current.length > PASSWORD_MAX_LENGTH) {
      throw new ValidationError("CURRENT_PASSWORD_WRONG");
    }
    parseOrThrow(changePasswordSchema, raw);
    const user = await this.users.findById(raw.adminId);
    if (!user) {
      throw new UnauthorizedError();
    }
    const matches = await this.hasher.verify(user.passwordHash, raw.current);
    if (!matches) {
      throw new ValidationError("CURRENT_PASSWORD_WRONG");
    }
    const nextHash = await this.hasher.hash(raw.next);
    await this.users.updatePasswordHash(user.id, nextHash);
  }
}
