# Security Implementation Guide

This document outlines the security measures implemented in the Digital Billboard Marketplace platform.

## Overview

The platform implements comprehensive security measures including:

- Input sanitization and XSS protection
- Rate limiting for API endpoints
- CSRF protection for form submissions
- Data encryption for sensitive information
- Audit logging for security events
- Privacy policy and terms of service compliance

## Security Components

### 1. Input Sanitization (`src/lib/security/sanitization.ts`)

Provides functions to sanitize and validate user inputs:

```typescript
import { sanitizeHtml, sanitizeText, sanitizeEmail } from "@/lib/security";

// Sanitize HTML content
const cleanHtml = sanitizeHtml(userInput);

// Sanitize plain text
const cleanText = sanitizeText(userInput);

// Validate and sanitize email
const cleanEmail = sanitizeEmail(emailInput);
```

### 2. Rate Limiting (`src/lib/security/rate-limit.ts`)

Implements different rate limits for different endpoint types:

- Authentication: 5 requests per 15 minutes
- API endpoints: 100 requests per hour
- Search: 200 requests per hour
- File upload: 10 uploads per hour
- Messaging: 50 messages per hour

```typescript
import { applyRateLimit } from "@/lib/security";

const result = await applyRateLimit(request, "api");
if (!result.success) {
  // Handle rate limit exceeded
}
```

### 3. CSRF Protection (`src/lib/security/csrf.ts`)

Provides CSRF token generation and validation:

```typescript
import { generateCSRFToken, verifyCSRFToken } from "@/lib/security";

// Generate token
const { token, secret } = generateCSRFToken();

// Verify token
const isValid = verifyCSRFToken(token, secret);
```

### 4. Data Encryption (`src/lib/security/encryption.ts`)

Encrypts sensitive personal information:

```typescript
import { encryptPII, decryptPII } from "@/lib/security";

// Encrypt sensitive data
const encrypted = encryptPII({
  contactNumber: "+27123456789",
  businessName: "My Business",
});

// Decrypt when needed
const decrypted = decryptPII(encrypted);
```

### 5. Audit Logging (`src/lib/security/audit-log.ts`)

Logs security events for monitoring:

```typescript
import { logAuditEvent, AuditEventType, AuditSeverity } from "@/lib/security";

await logAuditEvent({
  eventType: AuditEventType.USER_LOGIN,
  severity: AuditSeverity.LOW,
  userId: "user-id",
  ipAddress: "192.168.1.1",
  details: { success: true },
});
```

### 6. Security Middleware (`src/lib/security/middleware.ts`)

Provides comprehensive security middleware:

```typescript
import { createSecureHandler } from "@/lib/security";

export const POST = createSecureHandler(handler, {
  rateLimit: "api",
  requireCSRF: true,
  requireAuth: true,
});
```

## Environment Variables

Add these security-related environment variables:

```env
# Security
ENCRYPTION_KEY="your-32-character-encryption-key-here"
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Rate Limiting (Optional - for production with Upstash Redis)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

## Implementation Examples

### Secure API Route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSecureHandler, sanitizeText } from "@/lib/security";

async function handler(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const sanitizedData = {
    message: sanitizeText(body.message),
  };

  return NextResponse.json({ data: sanitizedData });
}

export const POST = createSecureHandler(handler, {
  rateLimit: "api",
  requireCSRF: true,
});
```

### Form with CSRF Protection

```typescript
import { generateCSRFToken } from '@/lib/security';

export default function SecureForm() {
  const { token } = generateCSRFToken();

  return (
    <form>
      <input type="hidden" name="csrf-token" value={token} />
      {/* Other form fields */}
    </form>
  );
}
```

## Security Headers

The middleware automatically adds these security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: [restrictive policy]`

## Legal Compliance

The platform includes:

- Privacy Policy (`/privacy-policy`) - POPIA compliant
- Terms of Service (`/terms-of-service`) - South African law

## Monitoring and Alerts

Security events are logged with structured data for monitoring:

```json
{
  "eventType": "RATE_LIMIT_EXCEEDED",
  "severity": "HIGH",
  "userId": "user-123",
  "ipAddress": "192.168.1.1",
  "timestamp": "2024-01-01T12:00:00Z",
  "details": {
    "endpoint": "/api/billboards",
    "limit": 100,
    "remaining": 0
  }
}
```

## Best Practices

1. **Always sanitize user inputs** before processing
2. **Use rate limiting** on all public API endpoints
3. **Implement CSRF protection** for state-changing operations
4. **Encrypt sensitive data** before storing in database
5. **Log security events** for monitoring and compliance
6. **Validate origins** for cross-origin requests
7. **Use HTTPS** in production
8. **Keep dependencies updated** for security patches

## Testing Security

Test security measures with:

```bash
# Test rate limiting
curl -X POST http://localhost:3000/api/test -H "Content-Type: application/json" -d '{}' --repeat 10

# Test CSRF protection
curl -X POST http://localhost:3000/api/secure-example -H "Content-Type: application/json" -d '{}'

# Test input sanitization
curl -X POST http://localhost:3000/api/test -H "Content-Type: application/json" -d '{"message": "<script>alert(\"xss\")</script>"}'
```

## Production Considerations

1. Set up proper Redis instance for rate limiting
2. Configure proper encryption keys
3. Set up log aggregation service
4. Monitor security events
5. Regular security audits
6. Keep security dependencies updated
