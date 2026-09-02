import { decodeJwt } from "jose";
import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "@/domain/errors";
import { SESSION_TTL_DAYS } from "@/lib/constants";
import { JoseSessionSigner } from "./session";

const SECRET = "unit-test-session-secret-32bytes!!";

describe("JoseSessionSigner", () => {
  const signer = new JoseSessionSigner(SECRET);

  it("signs an HS256 JWT with sub, iat, and 7-day exp", async () => {
    const token = await signer.sign("admin_1");
    const payload = decodeJwt(token);
    expect(payload.sub).toBe("admin_1");
    expect(typeof payload.iat).toBe("number");
    expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(
      SESSION_TTL_DAYS * 24 * 60 * 60,
    );
    await expect(signer.verify(token)).resolves.toEqual({ adminId: "admin_1" });
  });

  it("rejects tampered tokens and a different secret", async () => {
    const token = await signer.sign("admin_1");
    const other = new JoseSessionSigner("other-session-secret-32-bytes-ok!");
    await expect(signer.verify("not-a-jwt")).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    await expect(other.verify(token)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
