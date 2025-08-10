# Authentication System

This authentication system provides comprehensive user management for the Digital Billboard Marketplace, including registration, login, password reset, and role-based access control.

## Features

- **User Registration**: Secure user registration with role selection (Owner/Advertiser)
- **Login/Logout**: Session-based authentication using NextAuth.js
- **Password Reset**: Secure password reset with JWT tokens and email verification
- **Role-based Access Control**: Different permissions for Owners and Advertisers
- **Account Verification**: User verification system for enhanced security
- **Session Management**: Secure session handling with automatic timeout

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication (login/logout)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Protected Routes

- `GET /api/user/profile` - Get user profile (requires authentication)

## Usage Examples

### Client-side Authentication

```typescript
import { useAuth, useRole } from "@/lib/auth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isOwner, isAdvertiser } = useRole(UserRole.OWNER);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Server-side Authentication

```typescript
import { requireAuth, requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export default async function ProtectedPage() {
  const session = await requireAuth();
  // or
  const session = await requireRole([UserRole.OWNER]);

  return <div>Protected content for {session.user.name}</div>;
}
```

### API Route Protection

```typescript
import { withAuth, withRole } from "@/lib/auth/middleware";
import { UserRole } from "@prisma/client";

async function handler(request: NextRequest, user: any) {
  // Your protected API logic here
  return NextResponse.json({ message: "Success" });
}

export async function GET(request: NextRequest) {
  return withAuth(request, handler);
  // or
  return withRole(request, [UserRole.OWNER], handler);
}
```

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token generation for password reset
- **Session Security**: Automatic session timeout and secure cookie handling
- **Input Validation**: Comprehensive validation using Zod schemas
- **Rate Limiting**: Built-in protection against brute force attacks
- **CSRF Protection**: Cross-site request forgery protection

## Database Schema

The authentication system uses the following database models:

- `User`: Main user account information
- `PasswordResetToken`: Secure password reset tokens with expiration

## Environment Variables

Required environment variables:

```
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## Validation Rules

### Registration

- Name: 2-100 characters
- Email: Valid email format
- Password: Minimum 8 characters with uppercase, lowercase, number, and special character
- Phone: South African format (+27 or 0 followed by 9 digits)
- Business Name: Required for billboard owners

### Password Reset

- Tokens expire after 1 hour
- One-time use tokens
- Secure JWT encoding
