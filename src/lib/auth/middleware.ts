import { NextRequest, NextResponse } from "next/server";
import { getToken, JWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

/**
 * Middleware to protect API routes that require authentication
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JWT) => Promise<NextResponse>
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return handler(request, token);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

/**
 * Middleware to protect API routes that require specific roles
 */
export async function withRole(
  request: NextRequest,
  allowedRoles: UserRole[],
  handler: (request: NextRequest, user: JWT) => Promise<NextResponse>
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(token.role as UserRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(request, token);
  } catch (error) {
    console.error("Role middleware error:", error);
    return NextResponse.json(
      { error: "Authorization failed" },
      { status: 403 }
    );
  }
}

/**
 * Middleware to protect API routes that require verified users
 */
export async function withVerifiedUser(
  request: NextRequest,
  handler: (request: NextRequest, user: JWT) => Promise<NextResponse>
) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!token.verified) {
      return NextResponse.json(
        { error: "Account verification required" },
        { status: 403 }
      );
    }

    return handler(request, token);
  } catch (error) {
    console.error("Verification middleware error:", error);
    return NextResponse.json(
      { error: "Verification check failed" },
      { status: 403 }
    );
  }
}
