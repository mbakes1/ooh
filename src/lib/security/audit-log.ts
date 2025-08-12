// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

export enum AuditEventType {
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_REGISTRATION = "USER_REGISTRATION",
  PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_COMPLETE = "PASSWORD_RESET_COMPLETE",
  PROFILE_UPDATE = "PROFILE_UPDATE",
  BILLBOARD_CREATE = "BILLBOARD_CREATE",
  BILLBOARD_UPDATE = "BILLBOARD_UPDATE",
  BILLBOARD_DELETE = "BILLBOARD_DELETE",
  MESSAGE_SENT = "MESSAGE_SENT",
  FILE_UPLOAD = "FILE_UPLOAD",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  CSRF_VIOLATION = "CSRF_VIOLATION",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  DATA_EXPORT = "DATA_EXPORT",
  ADMIN_ACTION = "ADMIN_ACTION",
}

export enum AuditSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface AuditLogEntry {
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * Log security audit event
 */
export async function logAuditEvent(
  entry: Omit<AuditLogEntry, "timestamp">
): Promise<void> {
  try {
    // In a real implementation, you would save this to a dedicated audit log table
    // For now, we'll use console logging with structured format
    const auditEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    // Log to console in structured format
    console.log("[AUDIT]", JSON.stringify(auditEntry));

    // In production, you might want to:
    // 1. Save to a separate audit database
    // 2. Send to a logging service like DataDog, Splunk, etc.
    // 3. Store in a secure, append-only log file

    // Example of saving to database (you'd need to create an audit_logs table):
    /*
    await prisma.auditLog.create({
      data: {
        eventType: entry.eventType,
        severity: entry.severity,
        userId: entry.userId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        resourceId: entry.resourceId,
        resourceType: entry.resourceType,
        details: entry.details ? JSON.stringify(entry.details) : null,
        timestamp: auditEntry.timestamp,
      },
    });
    */
  } catch (error) {
    // Never let audit logging break the main application
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Log user authentication events
 */
export async function logAuthEvent(
  eventType:
    | AuditEventType.USER_LOGIN
    | AuditEventType.USER_LOGOUT
    | AuditEventType.USER_REGISTRATION,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
  success: boolean = true
): Promise<void> {
  await logAuditEvent({
    eventType,
    severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
    userId,
    ipAddress,
    userAgent,
    details: { success },
  });
}

/**
 * Log security violations
 */
export async function logSecurityViolation(
  eventType:
    | AuditEventType.RATE_LIMIT_EXCEEDED
    | AuditEventType.CSRF_VIOLATION
    | AuditEventType.UNAUTHORIZED_ACCESS,
  ipAddress?: string,
  userAgent?: string,
  userId?: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType,
    severity: AuditSeverity.HIGH,
    userId,
    ipAddress,
    userAgent,
    details,
  });
}

/**
 * Log data access events
 */
export async function logDataAccess(
  resourceType: string,
  resourceId: string,
  userId?: string,
  ipAddress?: string,
  action: string = "READ"
): Promise<void> {
  await logAuditEvent({
    eventType: AuditEventType.DATA_EXPORT,
    severity: AuditSeverity.LOW,
    userId,
    ipAddress,
    resourceType,
    resourceId,
    details: { action },
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  description: string,
  ipAddress?: string,
  userAgent?: string,
  userId?: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
    severity: AuditSeverity.CRITICAL,
    userId,
    ipAddress,
    userAgent,
    details: { description, ...details },
  });
}

/**
 * Get client information from request
 */
export function getClientInfo(request: Request): {
  ipAddress?: string;
  userAgent?: string;
} {
  const headers = request.headers;

  const forwarded = headers.get("x-forwarded-for");
  const ipAddress = forwarded
    ? forwarded.split(",")[0]
    : headers.get("x-real-ip") || "unknown";

  const userAgent = headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}
