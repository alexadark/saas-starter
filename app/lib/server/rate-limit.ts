export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  /** Total max requests per window. Set by the factory for use in headers. */
  max: number;
}

interface RateLimiterOptions {
  /** Window size in milliseconds. */
  windowMs: number;
  /** Maximum number of requests allowed per window. */
  max: number;
}

interface WindowEntry {
  count: number;
  windowStart: number;
}

const extractIp = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
};

/**
 * Creates an in-memory IP-based rate limiter using a sliding window strategy.
 *
 * @example
 * ```ts
 * const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });
 *
 * // In a loader/action:
 * const result = limiter(request);
 * if (!result.allowed) {
 *   return new Response("Too Many Requests", {
 *     status: 429,
 *     headers: getRateLimitHeaders(result),
 *   });
 * }
 * ```
 */
export const createRateLimiter = ({
  windowMs,
  max,
}: RateLimiterOptions): ((request: Request) => RateLimitResult) => {
  const store = new Map<string, WindowEntry>();

  // Periodic cleanup to avoid unbounded memory growth
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      if (now > entry.windowStart + windowMs) {
        store.delete(ip);
      }
    }
  }, 60_000);

  // Allow garbage collection in environments that support unref
  if (typeof cleanup === "object" && cleanup !== null && "unref" in cleanup) {
    (cleanup as { unref: () => void }).unref();
  }

  return (request: Request): RateLimitResult => {
    const ip = extractIp(request);
    const now = Date.now();

    const existing = store.get(ip);

    if (!existing || now > existing.windowStart + windowMs) {
      // Start a fresh window
      store.set(ip, { count: 1, windowStart: now });
      return {
        allowed: true,
        remaining: max - 1,
        resetAt: new Date(now + windowMs),
        max,
      };
    }

    existing.count += 1;
    const allowed = existing.count <= max;
    const remaining = Math.max(0, max - existing.count);
    const resetAt = new Date(existing.windowStart + windowMs);

    return { allowed, remaining, resetAt, max };
  };
};

/**
 * Converts a RateLimitResult into standard rate-limit HTTP headers.
 * Includes `Retry-After` only when the request is blocked.
 */
export const getRateLimitHeaders = (
  result: RateLimitResult,
): Record<string, string> => {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.max),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt.getTime() / 1000)),
  };

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil(
      (result.resetAt.getTime() - Date.now()) / 1000,
    );
    headers["Retry-After"] = String(Math.max(0, retryAfterSeconds));
  }

  return headers;
};
