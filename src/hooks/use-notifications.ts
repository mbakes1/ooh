"use client";

import { useCallback } from "react";
import {
  notifications,
  notifyPromise,
  dismissAllNotifications,
  dismissNotification,
} from "@/lib/notifications";

/**
 * Custom hook for managing notifications throughout the app
 * Provides easy access to all notification types and utilities
 */
export function useNotifications() {
  // Authentication notifications
  const auth = useCallback(
    () => ({
      loginSuccess: notifications.auth.loginSuccess,
      loginError: notifications.auth.loginError,
      logoutSuccess: notifications.auth.logoutSuccess,
      registrationSuccess: notifications.auth.registrationSuccess,
      registrationError: notifications.auth.registrationError,
      passwordResetSent: notifications.auth.passwordResetSent,
      passwordResetSuccess: notifications.auth.passwordResetSuccess,
      sessionExpired: notifications.auth.sessionExpired,
    }),
    []
  );

  // Billboard notifications
  const billboard = useCallback(
    () => ({
      createSuccess: notifications.billboard.createSuccess,
      createError: notifications.billboard.createError,
      updateSuccess: notifications.billboard.updateSuccess,
      updateError: notifications.billboard.updateError,
      deleteSuccess: notifications.billboard.deleteSuccess,
      deleteError: notifications.billboard.deleteError,
      favoriteAdded: notifications.billboard.favoriteAdded,
      favoriteRemoved: notifications.billboard.favoriteRemoved,
      shareSuccess: notifications.billboard.shareSuccess,
      bookingRequest: notifications.billboard.bookingRequest,
      bookingApproved: notifications.billboard.bookingApproved,
      bookingRejected: notifications.billboard.bookingRejected,
    }),
    []
  );

  // Message notifications
  const message = useCallback(
    () => ({
      sendSuccess: notifications.message.sendSuccess,
      sendError: notifications.message.sendError,
      newMessage: notifications.message.newMessage,
      conversationCreated: notifications.message.conversationCreated,
      messageDeleted: notifications.message.messageDeleted,
      conversationArchived: notifications.message.conversationArchived,
    }),
    []
  );

  // File notifications
  const file = useCallback(
    () => ({
      uploadStart: notifications.file.uploadStart,
      uploadSuccess: notifications.file.uploadSuccess,
      uploadError: notifications.file.uploadError,
      downloadStart: notifications.file.downloadStart,
      downloadSuccess: notifications.file.downloadSuccess,
      fileSizeError: notifications.file.fileSizeError,
      fileTypeError: notifications.file.fileTypeError,
    }),
    []
  );

  // User notifications
  const user = useCallback(
    () => ({
      profileUpdateSuccess: notifications.user.profileUpdateSuccess,
      profileUpdateError: notifications.user.profileUpdateError,
      avatarUpdateSuccess: notifications.user.avatarUpdateSuccess,
      emailVerificationSent: notifications.user.emailVerificationSent,
      emailVerified: notifications.user.emailVerified,
    }),
    []
  );

  // Payment notifications
  const payment = useCallback(
    () => ({
      paymentSuccess: notifications.payment.paymentSuccess,
      paymentError: notifications.payment.paymentError,
      paymentPending: notifications.payment.paymentPending,
      refundProcessed: notifications.payment.refundProcessed,
    }),
    []
  );

  // Admin notifications
  const admin = useCallback(
    () => ({
      userPromoted: notifications.admin.userPromoted,
      userDemoted: notifications.admin.userDemoted,
      userBanned: notifications.admin.userBanned,
      userUnbanned: notifications.admin.userUnbanned,
      contentModerated: notifications.admin.contentModerated,
    }),
    []
  );

  // System notifications
  const system = useCallback(
    () => ({
      maintenanceMode: notifications.system.maintenanceMode,
      maintenanceComplete: notifications.system.maintenanceComplete,
      connectionLost: notifications.system.connectionLost,
      connectionRestored: notifications.system.connectionRestored,
      updateAvailable: notifications.system.updateAvailable,
    }),
    []
  );

  // Generic notifications
  const generic = useCallback(
    () => ({
      success: notifications.generic.success,
      error: notifications.generic.error,
      warning: notifications.generic.warning,
      info: notifications.generic.info,
      loading: notifications.generic.loading,
    }),
    []
  );

  // Promise-based notifications for async operations
  const promise = useCallback(notifyPromise, []);

  // Utility functions
  const dismissAll = useCallback(dismissAllNotifications, []);
  const dismiss = useCallback(dismissNotification, []);

  return {
    auth: auth(),
    billboard: billboard(),
    message: message(),
    file: file(),
    user: user(),
    payment: payment(),
    admin: admin(),
    system: system(),
    generic: generic(),
    promise,
    dismissAll,
    dismiss,
  };
}

// Export individual notification categories for direct import
export const useAuthNotifications = () => useNotifications().auth;
export const useBillboardNotifications = () => useNotifications().billboard;
export const useMessageNotifications = () => useNotifications().message;
export const useFileNotifications = () => useNotifications().file;
export const useUserNotifications = () => useNotifications().user;
export const usePaymentNotifications = () => useNotifications().payment;
export const useAdminNotifications = () => useNotifications().admin;
export const useSystemNotifications = () => useNotifications().system;
export const useGenericNotifications = () => useNotifications().generic;
