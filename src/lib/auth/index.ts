// Configuration
export { authOptions } from "./config";

// Server utilities
export {
  getSession,
  getCurrentUser,
  requireAuth,
  requireRole,
  requireVerification,
} from "./server";

// Client hooks
export { useAuth, useRole, useVerification } from "./hooks";

// Middleware
export { withAuth, withRole, withVerifiedUser } from "./middleware";

// Utilities
export {
  hashPassword,
  verifyPassword,
  generateResetToken,
  generateResetJWT,
  verifyResetJWT,
  generateSessionToken,
} from "./utils";

// Components
export { AuthProvider } from "./session-provider";
