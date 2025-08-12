import { NextRequest, NextResponse } from "next/server";
import {
  createSecureHandler,
  sanitizeText,
  logAuditEvent,
  AuditEventType,
  AuditSeverity,
} from "@/lib/security";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// Example of a secure API route
async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and sanitize request body
    const body = await request.json();
    const sanitizedData = {
      message: sanitizeText(body.message || ""),
      title: sanitizeText(body.title || ""),
    };

    // Log the action for audit purposes
    await logAuditEvent({
      eventType: AuditEventType.DATA_EXPORT,
      severity: AuditSeverity.LOW,
      userId: session.user.id,
      resourceType: "secure-example",
      resourceId: "example-1",
      details: {
        action: "secure_api_access",
        sanitizedData,
      },
    });

    // Process the request
    const result = {
      success: true,
      data: sanitizedData,
      timestamp: new Date().toISOString(),
      user: session.user.email,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Secure API error:", error);

    // Log security incident
    await logAuditEvent({
      eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
      severity: AuditSeverity.HIGH,
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        endpoint: "/api/secure-example",
      },
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Apply security middleware with rate limiting and CSRF protection
export const POST = createSecureHandler(handler, {
  rateLimit: "api",
  requireCSRF: true,
  requireAuth: true,
});
