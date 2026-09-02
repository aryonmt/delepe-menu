import { hash, verify } from "@node-rs/argon2";
import type { PasswordHasher } from "@/domain/ports";
import {
  ARGON2_MEMORY_KIB,
  ARGON2_PARALLELISM,
  ARGON2_TIME_COST,
} from "@/lib/constants";

/** Defaults match argon2id; algorithm omitted because the enum is ambient. */
const HASH_OPTIONS = {
  memoryCost: ARGON2_MEMORY_KIB,
  timeCost: ARGON2_TIME_COST,
  parallelism: ARGON2_PARALLELISM,
} as const;

/** argon2id hasher (m=19456, t=2, p=1) — docs/10. */
export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return hash(plain, HASH_OPTIONS);
  }

  async verify(passwordHash: string, plain: string): Promise<boolean> {
    try {
      return await verify(passwordHash, plain);
    } catch {
      return false;
    }
  }
}
