import { SignJWT, jwtVerify } from "jose";
import { UnauthorizedError } from "@/domain/errors";
import type { SessionSigner } from "@/domain/ports";
import { SESSION_TTL_DAYS } from "@/lib/constants";

/** HS256 JWT session tokens. Payload { sub, iat, exp } per docs/10. */
export class JoseSessionSigner implements SessionSigner {
  private readonly secret: Uint8Array;

  constructor(secret: string) {
    this.secret = new TextEncoder().encode(secret);
  }

  async sign(adminId: string): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(adminId)
      .setIssuedAt()
      .setExpirationTime(`${SESSION_TTL_DAYS}d`)
      .sign(this.secret);
  }

  async verify(token: string): Promise<{ adminId: string }> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: ["HS256"],
      });
      if (typeof payload.sub !== "string" || payload.sub.length === 0) {
        throw new UnauthorizedError();
      }
      return { adminId: payload.sub };
    } catch {
      throw new UnauthorizedError();
    }
  }
}
