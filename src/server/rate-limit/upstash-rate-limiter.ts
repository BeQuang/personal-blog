import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import {
  MemoryRateLimiter,
  type RateLimiter,
  type RateLimitPolicy,
} from "./rate-limiter";

export class UpstashRateLimiter implements RateLimiter {
  private readonly limiters = new Map<string, Ratelimit>();

  constructor(private readonly redis: Redis) {}

  async check(
    namespace: string,
    identifier: string,
    policy: RateLimitPolicy,
  ) {
    const cacheKey = `${namespace}:${policy.limit}:${policy.window}`;
    let limiter = this.limiters.get(cacheKey);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: this.redis,
        limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
        prefix: `personal-blog:${namespace}`,
        analytics: false,
      });
      this.limiters.set(cacheKey, limiter);
    }

    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  }
}

let rateLimiter: RateLimiter | undefined;

export function getRateLimiter(): RateLimiter {
  if (rateLimiter) return rateLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    rateLimiter = new UpstashRateLimiter(new Redis({ url, token }));
    return rateLimiter;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Upstash Redis rate limiting is not configured");
  }

  rateLimiter = new MemoryRateLimiter();
  return rateLimiter;
}
