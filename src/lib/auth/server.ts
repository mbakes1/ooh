import { getServerSession } from "next-auth";
import { authOptions } from "./config";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

/**
 * Get the current session on the server side
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user or redirect to login
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return session.user;
}

/**
 * Require authentication and redirect if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return session;
}

/**
 * Require specific role and redirect if not authorized
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Require verified user and redirect if not verified
 */
export async function requireVerification() {
  const session = await requireAuth();

  if (!session.user.verified) {
    redirect("/auth/verify");
  }

  return session;
}
