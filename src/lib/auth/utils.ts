import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a JWT token for password reset with expiration
 */
export function generateResetJWT(userId: string, token: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }

  return jwt.sign(
    { userId, token },
    secret,
    { expiresIn: "1h" } // Token expires in 1 hour
  );
}

/**
 * Verify and decode a password reset JWT token
 */
export function verifyResetJWT(
  token: string
): { userId: string; token: string } | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error("NEXTAUTH_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret) as {
      userId: string;
      token: string;
    };
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
