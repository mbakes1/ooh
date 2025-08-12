import Tokens from "csrf";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const tokens = new Tokens();

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): { token: string; secret: string } {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);

  return { token, secret };
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, secret: string): boolean {
  return tokens.verify(secret, token);
}

/**
 * Get CSRF token from request headers or body
 */
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Check headers first
  const headerToken =
    request.headers.get("x-csrf-token") || request.headers.get("x-xsrf-token");

  if (headerToken) {
    return headerToken;
  }

  // For form submissions, token might be in body
  // This would need to be handled in the API route after parsing the body
  return null;
}

/**
 * Get CSRF secret from cookies (async version for server components)
 */
export async function getCSRFSecret(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("csrf-secret")?.value || null;
}

/**
 * Set CSRF secret in cookies (async version for server components)
 */
export async function setCSRFSecret(secret: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("csrf-secret", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Middleware to validate CSRF token
 */
export async function validateCSRFToken(
  request: NextRequest
): Promise<boolean> {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  const token = getCSRFTokenFromRequest(request);
  const secret = await getCSRFSecret();

  if (!token || !secret) {
    return false;
  }

  return verifyCSRFToken(token, secret);
}

/**
 * Create CSRF error response
 */
export function createCSRFErrorResponse(): Response {
  return new Response(
    JSON.stringify({
      error: "CSRF token validation failed",
      message: "Invalid or missing CSRF token",
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
