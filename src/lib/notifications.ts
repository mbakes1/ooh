"use client";

import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  MessageSquare,
  Monitor as Billboard,
  User,
  DollarSign,
  Shield,
  Upload,
  Download,
  Trash2,
  Edit,
  Heart,
  Share2,
  Settings,
  Bell,
} from "lucide-react";

// Notification types
export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "promise";

// Notification categories for better organization
export type NotificationCategory =
  | "auth"
  | "billboard"
  | "message"
  | "user"
  | "payment"
  | "admin"
  | "file"
  | "system"
  | "social";

interface NotificationOptions {
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NotificationConfig {
  title: string;
  type: NotificationType;
  options?: NotificationOptions;
}

// Confetti component for notifications
const ConfettiNotification = ({ title, description, icon: IconComponent }) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    const timer = setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex items-center">
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
      <div>
        <div className="font-semibold">{title}</div>
        {description && <div className="text-sm">{description}</div>}
      </div>
    </div>
  );
};

// Core notification function
export function notify(config: NotificationConfig) {
  const { title, type, options = {} } = config;
  const {
    duration,
    dismissible = true,
    action,
    description,
    icon: CustomIcon,
  } = options;

  const baseOptions = {
    duration: duration || (type === "error" ? 6000 : 4000),
    dismissible,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
    description,
  };

  switch (type) {
    case "success":
      // Special handler for login success to show confetti
      if (title.toLowerCase().includes("welcome back")) {
        return toast.custom(
          () => (
            <ConfettiNotification
              title={title}
              description={description}
              icon={CustomIcon || CheckCircle}
            />
          ),
          { ...baseOptions }
        );
      }
      return toast.success(title, {
        ...baseOptions,
        icon: CustomIcon
          ? React.createElement(CustomIcon, { className: "h-4 w-4" })
          : React.createElement(CheckCircle, { className: "h-4 w-4" }),
      });

    case "error":
      return toast.error(title, {
        ...baseOptions,
        icon: CustomIcon
          ? React.createElement(CustomIcon, { className: "h-4 w-4" })
          : React.createElement(XCircle, { className: "h-4 w-4" }),
      });

    case "warning":
      return toast.warning(title, {
        ...baseOptions,
        icon: CustomIcon
          ? React.createElement(CustomIcon, { className: "h-4 w-4" })
          : React.createElement(AlertCircle, { className: "h-4 w-4" }),
      });

    case "info":
      return toast.info(title, {
        ...baseOptions,
        icon: CustomIcon
          ? React.createElement(CustomIcon, { className: "h-4 w-4" })
          : React.createElement(Info, { className: "h-4 w-4" }),
      });

    case "loading":
      return toast.loading(title, {
        ...baseOptions,
        icon: CustomIcon
          ? React.createElement(CustomIcon, { className: "h-4 w-4" })
          : React.createElement(Loader2, { className: "h-4 w-4 animate-spin" }),
      });

    default:
      return toast(title, baseOptions);
  }
}

// Promise-based notifications for async operations
export function notifyPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) {
  return toast.promise(promise, messages);
}

// Predefined notification templates for common actions
export const notifications = {
  // Authentication notifications
  auth: {
    loginSuccess: (username?: string) =>
      notify({
        title: `Welcome back${username ? `, ${username}` : ""}!`,
        type: "success", // This will be handled by our custom logic
        options: {
          icon: User,
          description: "You have been successfully logged in.",
          duration: 5000,
        },
      }),

    loginError: (error?: string) =>
      notify({
        title: "Login failed",
        type: "error",
        options: {
          icon: User,
          description: error || "Please check your credentials and try again.",
        },
      }),

    logoutSuccess: () =>
      notify({
        title: "Logged out successfully",
        type: "success",
        options: {
          icon: User,
          description: "See you next time!",
        },
      }),

    registrationSuccess: () =>
      notify({
        title: "Account created successfully!",
        type: "success",
        options: {
          icon: User,
          description: "Welcome to the Digital Billboard Marketplace.",
        },
      }),

    registrationError: (error?: string) =>
      notify({
        title: "Registration failed",
        type: "error",
        options: {
          icon: User,
          description: error || "Please try again.",
        },
      }),

    passwordResetSent: () =>
      notify({
        title: "Password reset email sent",
        type: "success",
        options: {
          icon: User,
          description: "Check your email for reset instructions.",
        },
      }),

    passwordResetSuccess: () =>
      notify({
        title: "Password updated successfully",
        type: "success",
        options: {
          icon: User,
          description: "You can now log in with your new password.",
        },
      }),

    sessionExpired: () =>
      notify({
        title: "Session expired",
        type: "warning",
        options: {
          icon: User,
          description: "Please log in again to continue.",
          duration: 6000,
        },
      }),
  },

  // Billboard notifications
  billboard: {
    createSuccess: (billboardName?: string) =>
      notify({
        title: `Billboard ${billboardName ? `"${billboardName}" ` : ""}created successfully!`,
        type: "success",
        options: {
          icon: Billboard,
          description: "Your billboard is now live and available for booking.",
        },
      }),

    createError: (error?: string) =>
      notify({
        title: "Failed to create billboard",
        type: "error",
        options: {
          icon: Billboard,
          description: error || "Please try again.",
        },
      }),

    updateSuccess: (billboardName?: string) =>
      notify({
        title: `Billboard ${billboardName ? `"${billboardName}" ` : ""}updated successfully!`,
        type: "success",
        options: {
          icon: Edit,
          description: "Your changes have been saved.",
        },
      }),

    updateError: (error?: string) =>
      notify({
        title: "Failed to update billboard",
        type: "error",
        options: {
          icon: Edit,
          description: error || "Please try again.",
        },
      }),

    deleteSuccess: (billboardName?: string) =>
      notify({
        title: `Billboard ${billboardName ? `"${billboardName}" ` : ""}deleted successfully`,
        type: "success",
        options: {
          icon: Trash2,
          description: "The billboard has been permanently removed.",
        },
      }),

    deleteError: (error?: string) =>
      notify({
        title: "Failed to delete billboard",
        type: "error",
        options: {
          icon: Trash2,
          description: error || "Please try again.",
        },
      }),

    favoriteAdded: (billboardName?: string) =>
      notify({
        title: `Added ${billboardName ? `"${billboardName}" ` : "billboard "}to favorites`,
        type: "success",
        options: {
          icon: Heart,
          description: "You can find it in your favorites list.",
          duration: 3000,
        },
      }),

    favoriteRemoved: (billboardName?: string) =>
      notify({
        title: `Removed ${billboardName ? `"${billboardName}" ` : "billboard "}from favorites`,
        type: "info",
        options: {
          icon: Heart,
          duration: 3000,
        },
      }),

    shareSuccess: () =>
      notify({
        title: "Billboard link copied to clipboard",
        type: "success",
        options: {
          icon: Share2,
          duration: 3000,
        },
      }),

    bookingRequest: (billboardName?: string) =>
      notify({
        title: "Booking request sent",
        type: "success",
        options: {
          icon: Billboard,
          description: `Your booking request for ${billboardName || "the billboard"} has been sent to the owner.`,
        },
      }),

    bookingApproved: (billboardName?: string) =>
      notify({
        title: "Booking approved!",
        type: "success",
        options: {
          icon: CheckCircle,
          description: `Your booking for ${billboardName || "the billboard"} has been approved.`,
        },
      }),

    bookingRejected: (billboardName?: string) =>
      notify({
        title: "Booking declined",
        type: "warning",
        options: {
          icon: XCircle,
          description: `Your booking request for ${billboardName || "the billboard"} was declined.`,
        },
      }),
  },

  // Messaging notifications
  message: {
    sendSuccess: () =>
      notify({
        title: "Message sent",
        type: "success",
        options: {
          icon: MessageSquare,
          duration: 2000,
        },
      }),

    sendError: (error?: string) =>
      notify({
        title: "Failed to send message",
        type: "error",
        options: {
          icon: MessageSquare,
          description: error || "Please try again.",
        },
      }),

    newMessage: (senderName?: string) =>
      notify({
        title: `New message${senderName ? ` from ${senderName}` : ""}`,
        type: "info",
        options: {
          icon: MessageSquare,
          description: "Click to view the conversation.",
          duration: 5000,
        },
      }),

    conversationCreated: () =>
      notify({
        title: "Conversation started",
        type: "success",
        options: {
          icon: MessageSquare,
          description: "You can now exchange messages.",
          duration: 3000,
        },
      }),

    messageDeleted: () =>
      notify({
        title: "Message deleted",
        type: "success",
        options: {
          icon: Trash2,
          duration: 2000,
        },
      }),

    conversationArchived: () =>
      notify({
        title: "Conversation archived",
        type: "success",
        options: {
          icon: MessageSquare,
          duration: 3000,
        },
      }),
  },

  // File upload notifications
  file: {
    uploadStart: (fileName?: string) =>
      notify({
        title: `Uploading ${fileName || "file"}...`,
        type: "loading",
        options: {
          icon: Upload,
          dismissible: false,
        },
      }),

    uploadSuccess: (fileName?: string) =>
      notify({
        title: `${fileName || "File"} uploaded successfully`,
        type: "success",
        options: {
          icon: Upload,
          duration: 3000,
        },
      }),

    uploadError: (fileName?: string, error?: string) =>
      notify({
        title: `Failed to upload ${fileName || "file"}`,
        type: "error",
        options: {
          icon: Upload,
          description: error || "Please try again.",
        },
      }),

    downloadStart: (fileName?: string) =>
      notify({
        title: `Downloading ${fileName || "file"}...`,
        type: "loading",
        options: {
          icon: Download,
          dismissible: false,
        },
      }),

    downloadSuccess: (fileName?: string) =>
      notify({
        title: `${fileName || "File"} downloaded successfully`,
        type: "success",
        options: {
          icon: Download,
          duration: 3000,
        },
      }),

    fileSizeError: () =>
      notify({
        title: "File too large",
        type: "error",
        options: {
          icon: Upload,
          description: "Please select a file smaller than 10MB.",
        },
      }),

    fileTypeError: () =>
      notify({
        title: "Invalid file type",
        type: "error",
        options: {
          icon: Upload,
          description: "Please select a valid image file.",
        },
      }),
  },

  // User profile notifications
  user: {
    profileUpdateSuccess: () =>
      notify({
        title: "Profile updated successfully",
        type: "success",
        options: {
          icon: User,
          description: "Your changes have been saved.",
        },
      }),

    profileUpdateError: (error?: string) =>
      notify({
        title: "Failed to update profile",
        type: "error",
        options: {
          icon: User,
          description: error || "Please try again.",
        },
      }),

    avatarUpdateSuccess: () =>
      notify({
        title: "Profile picture updated",
        type: "success",
        options: {
          icon: User,
          duration: 3000,
        },
      }),

    emailVerificationSent: () =>
      notify({
        title: "Verification email sent",
        type: "success",
        options: {
          icon: User,
          description: "Please check your email to verify your account.",
        },
      }),

    emailVerified: () =>
      notify({
        title: "Email verified successfully",
        type: "success",
        options: {
          icon: CheckCircle,
          description: "Your account is now fully verified.",
        },
      }),
  },

  // Payment notifications
  payment: {
    paymentSuccess: (amount?: string) =>
      notify({
        title: `Payment ${amount ? `of ${amount} ` : ""}successful`,
        type: "success",
        options: {
          icon: DollarSign,
          description: "Your transaction has been completed.",
        },
      }),

    paymentError: (error?: string) =>
      notify({
        title: "Payment failed",
        type: "error",
        options: {
          icon: DollarSign,
          description:
            error || "Please try again or use a different payment method.",
        },
      }),

    paymentPending: () =>
      notify({
        title: "Payment processing",
        type: "info",
        options: {
          icon: DollarSign,
          description:
            "Your payment is being processed. You will be notified once completed.",
        },
      }),

    refundProcessed: (amount?: string) =>
      notify({
        title: `Refund ${amount ? `of ${amount} ` : ""}processed`,
        type: "success",
        options: {
          icon: DollarSign,
          description:
            "The refund will appear in your account within 3-5 business days.",
        },
      }),
  },

  // Admin notifications
  admin: {
    userPromoted: (username?: string) =>
      notify({
        title: `${username || "User"} promoted to admin`,
        type: "success",
        options: {
          icon: Shield,
          description: "Admin privileges have been granted.",
        },
      }),

    userDemoted: (username?: string) =>
      notify({
        title: `${username || "User"} removed from admin`,
        type: "success",
        options: {
          icon: Shield,
          description: "Admin privileges have been revoked.",
        },
      }),

    userBanned: (username?: string) =>
      notify({
        title: `${username || "User"} has been banned`,
        type: "warning",
        options: {
          icon: Shield,
          description: "The user can no longer access the platform.",
        },
      }),

    userUnbanned: (username?: string) =>
      notify({
        title: `${username || "User"} has been unbanned`,
        type: "success",
        options: {
          icon: Shield,
          description: "The user can now access the platform again.",
        },
      }),

    contentModerated: () =>
      notify({
        title: "Content moderated",
        type: "success",
        options: {
          icon: Shield,
          description: "The content has been reviewed and action taken.",
        },
      }),
  },

  // System notifications
  system: {
    maintenanceMode: () =>
      notify({
        title: "Maintenance mode enabled",
        type: "warning",
        options: {
          icon: Settings,
          description: "The system will be unavailable for a short period.",
          duration: 8000,
        },
      }),

    maintenanceComplete: () =>
      notify({
        title: "Maintenance complete",
        type: "success",
        options: {
          icon: Settings,
          description: "All systems are now operational.",
        },
      }),

    connectionLost: () =>
      notify({
        title: "Connection lost",
        type: "error",
        options: {
          icon: AlertCircle,
          description: "Trying to reconnect...",
          duration: 0, // Don't auto-dismiss
        },
      }),

    connectionRestored: () =>
      notify({
        title: "Connection restored",
        type: "success",
        options: {
          icon: CheckCircle,
          description: "You are back online.",
          duration: 3000,
        },
      }),

    updateAvailable: () =>
      notify({
        title: "Update available",
        type: "info",
        options: {
          icon: Bell,
          description: "A new version is available. Refresh to update.",
          action: {
            label: "Refresh",
            onClick: () => window.location.reload(),
          },
        },
      }),
  },

  // Generic notifications
  generic: {
    success: (message: string, description?: string) =>
      notify({
        title: message,
        type: "success",
        options: { description },
      }),

    error: (message: string, description?: string) =>
      notify({
        title: message,
        type: "error",
        options: { description },
      }),

    warning: (message: string, description?: string) =>
      notify({
        title: message,
        type: "warning",
        options: { description },
      }),

    info: (message: string, description?: string) =>
      notify({
        title: message,
        type: "info",
        options: { description },
      }),

    loading: (message: string, description?: string) =>
      notify({
        title: message,
        type: "loading",
        options: { description, dismissible: false },
      }),
  },
};

// Utility function to dismiss all notifications
export function dismissAllNotifications() {
  toast.dismiss();
}

// Utility function to dismiss a specific notification
export function dismissNotification(toastId: string | number) {
  toast.dismiss(toastId);
}
