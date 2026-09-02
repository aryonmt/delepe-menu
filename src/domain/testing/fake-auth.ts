import { UnauthorizedError } from "@/domain/errors";
import type { PasswordHasher, SessionSigner } from "@/domain/ports";

/** Deterministic hasher for use-case tests (no argon2 cost). */
export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hash:${plain}`;
  }

  async verify(passwordHash: string, plain: string): Promise<boolean> {
    return passwordHash === `hash:${plain}`;
  }
}

/** Unsigned token format `token:<adminId>` for use-case tests. */
export class FakeSessionSigner implements SessionSigner {
  async sign(adminId: string): Promise<string> {
    return `token:${adminId}`;
  }

  async verify(token: string): Promise<{ adminId: string }> {
    if (!token.startsWith("token:")) {
      throw new UnauthorizedError();
    }
    const adminId = token.slice("token:".length);
    if (adminId.length === 0) {
      throw new UnauthorizedError();
    }
    return { adminId };
  }
}
