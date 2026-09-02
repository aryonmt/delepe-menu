import { UnauthorizedError } from "@/domain/errors";
import type { SessionSigner } from "@/domain/ports";

/**
 * Confirms the session JWT. Missing or invalid cookies are the same error so
 * callers never distinguish "no cookie" from "forged cookie".
 */
export class VerifySessionUseCase {
  constructor(private readonly sessions: SessionSigner) {}

  async execute(input: unknown): Promise<{ adminId: string }> {
    const token = readToken(input);
    if (!token) {
      throw new UnauthorizedError();
    }
    return this.sessions.verify(token);
  }
}

function readToken(input: unknown): string | undefined {
  if (!input || typeof input !== "object" || !("token" in input)) {
    return undefined;
  }
  const token = (input as { token?: unknown }).token;
  if (typeof token !== "string" || token.length === 0) {
    return undefined;
  }
  return token;
}
