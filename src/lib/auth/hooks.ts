"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

/**
 * Hook to get the current user session
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
    status,
  };
}

/**
 * Hook to check if user has specific role
 */
export function useRole(requiredRole: UserRole) {
  const { user, isAuthenticated } = useAuth();

  return {
    hasRole: isAuthenticated && user?.role === requiredRole,
    isOwner: isAuthenticated && user?.role === UserRole.OWNER,
    isAdvertiser: isAuthenticated && user?.role === UserRole.ADVERTISER,
  };
}

/**
 * Hook to check if user is verified
 */
export function useVerification() {
  const { user, isAuthenticated } = useAuth();

  return {
    isVerified: isAuthenticated && user?.verified,
    needsVerification: isAuthenticated && !user?.verified,
  };
}
