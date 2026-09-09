import { RateLimitError } from "@/domain/errors";
import type { LoginRateLimiter } from "@/domain/ports";
import {
  LOGIN_RATE_LIMIT_MAX,
  LOGIN_RATE_LIMIT_WINDOW_MS,
} from "@/lib/constants";

type Bucket = { count: number; windowStart: number };

/**
 * In-memory limiter: 5 failures / 15 min per key (single-instance, docs/10).
 * The next attempt after MAX failures is RATE_LIMITED.
 */
export class InMemoryLoginRateLimiter implements LoginRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly now: () => number;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  async assertAllowed(key: string): Promise<void> {
    this.pruneExpired();
    this.evictIfOverCap();
    const bucket = this.activeBucket(key);
    if (bucket && bucket.count >= LOGIN_RATE_LIMIT_MAX) {
      throw new RateLimitError();
    }
  }

  async recordFailure(key: string): Promise<void> {
    this.pruneExpired();
    this.evictIfOverCap();
    const at = this.now();
    const bucket = this.activeBucket(key);
    if (!bucket) {
      this.buckets.set(key, { count: 1, windowStart: at });
      return;
    }
    bucket.count += 1;
  }

  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }

  private activeBucket(key: string): Bucket | undefined {
    const bucket = this.buckets.get(key);
    if (!bucket) {
      return undefined;
    }
    if (this.now() - bucket.windowStart >= LOGIN_RATE_LIMIT_WINDOW_MS) {
      this.buckets.delete(key);
      return undefined;
    }
    return bucket;
  }

  private pruneExpired(): void {
    const at = this.now();
    for (const [key, bucket] of this.buckets) {
      if (at - bucket.windowStart >= LOGIN_RATE_LIMIT_WINDOW_MS) {
        this.buckets.delete(key);
      }
    }
  }

  /** Caps unique attacker keys so the Map cannot grow without bound. */
  private evictIfOverCap(): void {
    while (this.buckets.size > 4_096) {
      const oldest = this.buckets.keys().next().value;
      if (oldest === undefined) break;
      this.buckets.delete(oldest);
    }
  }
}
