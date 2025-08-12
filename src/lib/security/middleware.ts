import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, createRateLimitResponse } from "./rate-limit";
import { validateCSRFToken, createCSRFErrorResponse } from "./csrf";
import {
  logSecurityViolation,
  logAuditEvent,
  getClientInfo,
  AuditEventType,
  AuditSeverity,
} from "./audit-log";

/**
 * Security middleware configuration
 */
interface SecurityConfig {
  rateLimit?: keyof typeof import("./rate-limit").rateLimits;
  requireCSRF?: boolean;
  requireAuth?: boolean;
}

/**
 * Apply security middleware to API routes
 */
export async function withSecurity(
  request: NextRequest,
  config: SecurityConfig = {}
): Promise<NextResponse | null> {
  const { ipAddress, userAgent } = getClientInfo(request);

  try {
    // Apply rate limiting if configured
    if (config.rateLimit) {
      const rateLimitResult = await applyRateLimit(request, config.rateLimit);

      if (!rateLimitResult.success) {
        // Log rate limit violation
        await logSecurityViolation(
          AuditEventType.RATE_LIMIT_EXCEEDED,
          ipAddress,
          userAgent,
          undefined,
          {
            endpoint: request.url,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
          }
        );

        return new NextResponse(
          createRateLimitResponse(
            rateLimitResult.limit,
            rateLimitResult.remaining,
            rateLimitResult.reset
          ).body,
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": rateLimitResult.limit.toString(),
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
              "X-RateLimit-Reset": rateLimitResult.reset.getTime().toString(),
            },
          }
        );
      }
    }

    // Apply CSRF protection if configured
    if (config.requireCSRF) {
      const csrfValid = await validateCSRFToken(request);

      if (!csrfValid) {
        // Log CSRF violation
        await logSecurityViolation(
          AuditEventType.CSRF_VIOLATION,
          ipAddress,
          userAgent,
          undefined,
          { endpoint: request.url }
        );

        return new NextResponse(createCSRFErrorResponse().body, {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Add security headers
    const response = NextResponse.next();

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );

    return null; // Continue with the request
  } catch (error) {
    console.error("Security middleware error:", error);

    // Log the error but don't block the request
    await logAuditEvent({
      eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
      severity: AuditSeverity.HIGH,
      ipAddress,
      userAgent,
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        endpoint: request.url,
      },
    });

    return null; // Continue with the request
  }
}

/**
 * Create a secure API route handler
 */
export function createSecureHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: SecurityConfig = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply security middleware
    const securityResponse = await withSecurity(request, config);

    if (securityResponse) {
      return securityResponse;
    }

    // Continue with the original handler
    return handler(request);
  };
}

/**
 * Validate request origin for additional security
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "https://yourdomain.com",
  ];

  if (!origin) {
    return false;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Sanitize request headers
 */
export function sanitizeHeaders(request: NextRequest): Record<string, string> {
  const sanitized: Record<string, string> = {};

  // Only allow specific headers
  const allowedHeaders = [
    "content-type",
    "authorization",
    "x-csrf-token",
    "x-xsrf-token",
    "user-agent",
    "accept",
    "accept-language",
  ];

  allowedHeaders.forEach((header) => {
    const value = request.headers.get(header);
    if (value) {
      sanitized[header] = value;
    }
  });

  return sanitized;
}
