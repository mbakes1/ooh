// Security utilities exports
export * from "./sanitization";
export * from "./rate-limit";
export * from "./csrf";
export * from "./encryption";
export * from "./audit-log";
export * from "./middleware";

// Re-export commonly used functions
export {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizePhoneNumber,
} from "./sanitization";

export { applyRateLimit, rateLimits } from "./rate-limit";

export { generateCSRFToken, verifyCSRFToken } from "./csrf";

export { encrypt, decrypt, encryptPII, decryptPII } from "./encryption";

export {
  logAuditEvent,
  logAuthEvent,
  logSecurityViolation,
  AuditEventType,
  AuditSeverity,
} from "./audit-log";

export { withSecurity, createSecureHandler } from "./middleware";
