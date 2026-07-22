import "server-only";

export interface RateLimitPolicy {
  limit: number;
  window: `${number} ${"s" | "m" | "h" | "d"}`;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  check(
    namespace: string,
    identifier: string,
    policy: RateLimitPolicy,
  ): Promise<RateLimitResult>;
}

interface MemoryEntry {
  count: number;
  resetAt: number;
}

function durationToMilliseconds(duration: RateLimitPolicy["window"]) {
  const [amountText, unit] = duration.split(" ");
  const amount = Number(amountText);
  const multipliers = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;
  return amount * multipliers[unit as keyof typeof multipliers];
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly entries = new Map<string, MemoryEntry>();

  async check(
    namespace: string,
    identifier: string,
    policy: RateLimitPolicy,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `${namespace}:${identifier}`;
    const existing = this.entries.get(key);
    const entry =
      !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + durationToMilliseconds(policy.window) }
        : existing;

    entry.count += 1;
    this.entries.set(key, entry);
    return {
      success: entry.count <= policy.limit,
      limit: policy.limit,
      remaining: Math.max(0, policy.limit - entry.count),
      resetAt: entry.resetAt,
    };
  }
}
