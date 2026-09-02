import { describe, expect, it } from "vitest";
import { RateLimitError } from "@/domain/errors";
import {
  LOGIN_RATE_LIMIT_MAX,
  LOGIN_RATE_LIMIT_WINDOW_MS,
} from "@/lib/constants";
import { InMemoryLoginRateLimiter } from "./rate-limiter";

describe("InMemoryLoginRateLimiter", () => {
  it("allows five failures and rejects the sixth in the same window", async () => {
    const limiter = new InMemoryLoginRateLimiter();
    const key = "127.0.0.1\0admin";
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i += 1) {
      await limiter.assertAllowed(key);
      await limiter.recordFailure(key);
    }
    await expect(limiter.assertAllowed(key)).rejects.toBeInstanceOf(RateLimitError);
  });

  it("resets the bucket after a successful login and after the window", async () => {
    let now = 1_000;
    const limiter = new InMemoryLoginRateLimiter(() => now);
    const key = "10.0.0.1\0lockout";
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i += 1) {
      await limiter.assertAllowed(key);
      await limiter.recordFailure(key);
    }
    await limiter.reset(key);
    await limiter.assertAllowed(key);

    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i += 1) {
      await limiter.assertAllowed(key);
      await limiter.recordFailure(key);
    }
    now += LOGIN_RATE_LIMIT_WINDOW_MS;
    await limiter.assertAllowed(key);
  });
});
