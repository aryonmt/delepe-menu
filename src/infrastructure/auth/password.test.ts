import { describe, expect, it } from "vitest";
import { Argon2PasswordHasher } from "./password";

describe("Argon2PasswordHasher", () => {
  const hasher = new Argon2PasswordHasher();

  it("hashes with argon2id and verifies the matching password", async () => {
    const hashed = await hasher.hash("correct-horse");
    expect(hashed.startsWith("$argon2id$")).toBe(true);
    expect(await hasher.verify(hashed, "correct-horse")).toBe(true);
  });

  it("rejects a wrong password and a malformed hash", async () => {
    const hashed = await hasher.hash("correct-horse");
    expect(await hasher.verify(hashed, "wrong")).toBe(false);
    expect(await hasher.verify("not-a-hash", "correct-horse")).toBe(false);
  });
});
