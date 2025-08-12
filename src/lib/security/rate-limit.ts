import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "memory://",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Different rate limits for different endpoints
export const rateLimits = {
  // Authentication endpoints - stricter limits
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
    analytics: true,
  }),

  // API endpoints - moderate limits
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests per hour
    analytics: true,
  }),

  // Search endpoints - higher limits
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1 h"), // 200 requests per hour
    analytics: true,
  }),

  // File upload - very strict limits
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 uploads per hour
    analytics: true,
  }),

  // Message sending - moderate limits
  messaging: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "1 h"), // 50 messages per hour
    analytics: true,
  }),
};

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from session/token first
  const userId = request.headers.get("x-user-id");
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
  return `ip:${ip}`;
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: NextRequest,
  limitType: keyof typeof rateLimits
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const identifier = getClientIdentifier(request);
  const rateLimit = rateLimits[limitType];

  const { success, limit, remaining, reset } =
    await rateLimit.limit(identifier);

  return { success, limit, remaining, reset };
}

/**
 * Middleware helper for rate limiting
 */
export function createRateLimitResponse(
  limit: number,
  remaining: number,
  reset: Date
): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message: "Too many requests. Please try again later.",
      limit,
      remaining,
      resetTime: reset.toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.getTime().toString(),
        "Retry-After": Math.ceil(
          (reset.getTime() - Date.now()) / 1000
        ).toString(),
      },
    }
  );
}
