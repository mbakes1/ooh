import { NextRequest } from "next/server";

// Simple in-memory rate limiting for development
const memoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

// Rate limit configurations
const rateLimitConfigs = {
  auth: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  api: { limit: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
  search: { limit: 200, windowMs: 60 * 60 * 1000 }, // 200 requests per hour
  upload: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  messaging: { limit: 50, windowMs: 60 * 60 * 1000 }, // 50 messages per hour
};

/**
 * Simple in-memory rate limiting (for development)
 */
function simpleRateLimit(
  identifier: string,
  config: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const existing = memoryStore.get(key);

  // Clean up expired entries
  if (existing && now > existing.resetTime) {
    memoryStore.delete(key);
  }

  const current = memoryStore.get(key) || {
    count: 0,
    resetTime: now + config.windowMs,
  };

  if (current.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: new Date(current.resetTime),
    };
  }

  current.count++;
  memoryStore.set(key, current);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - current.count,
    reset: new Date(current.resetTime),
  };
}

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
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0] : realIp || "unknown";
  return `ip:${ip}`;
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: NextRequest,
  limitType: keyof typeof rateLimitConfigs
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request);
  const config = rateLimitConfigs[limitType];

  // For now, use simple in-memory rate limiting
  // In production, you would use Redis-based rate limiting
  return simpleRateLimit(identifier, config);
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

// Export for backward compatibility
export const rateLimits = rateLimitConfigs;
