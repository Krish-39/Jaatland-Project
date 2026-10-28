/**
 * Small fixed-window rate limiter kept in memory.
 *
 * It is per server instance, so on serverless hosting it is a speed bump,
 * not a hard guarantee. Good enough to stop one client from hammering the
 * payment route in a demo; use a shared store (e.g. Redis) in production.
 */
export interface RateLimiter {
  /** Returns true if the request is allowed, false if the key is over its limit. */
  check(key: string, now?: number): boolean;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key, now = Date.now()) {
      const entry = hits.get(key);

      if (!entry || now >= entry.resetAt) {
        if (hits.size >= maxKeys) {
          // Drop expired entries; if still full, forget the oldest key.
          for (const [storedKey, value] of hits) {
            if (now >= value.resetAt) hits.delete(storedKey);
          }
          if (hits.size >= maxKeys) {
            const oldest = hits.keys().next().value;
            if (oldest !== undefined) hits.delete(oldest);
          }
        }
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (entry.count >= limit) return false;
      entry.count += 1;
      return true;
    },
  };
}

/** Best-effort client identifier from proxy headers. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}
