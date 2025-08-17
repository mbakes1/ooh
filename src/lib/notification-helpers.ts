"use client";

import { notifications, dismissNotification } from "./notifications";

/**
 * Helper functions to quickly add notifications to existing components
 * without needing to import hooks or manage state
 */

// Quick notification helpers for common patterns
export const quickNotify = {
  // Success patterns
  saved: () => notifications.generic.success("Changes saved successfully"),
  created: (itemName?: string) =>
    notifications.generic.success(`${itemName || "Item"} created successfully`),
  updated: (itemName?: string) =>
    notifications.generic.success(`${itemName || "Item"} updated successfully`),
  deleted: (itemName?: string) =>
    notifications.generic.success(`${itemName || "Item"} deleted successfully`),
  copied: () => notifications.generic.success("Copied to clipboard"),

  // Error patterns
  saveFailed: (error?: string) =>
    notifications.generic.error(
      "Failed to save changes",
      error || "Please try again"
    ),
  loadFailed: (error?: string) =>
    notifications.generic.error(
      "Failed to load data",
      error || "Please refresh the page"
    ),
  networkError: () =>
    notifications.generic.error(
      "Network error",
      "Please check your connection and try again"
    ),
  unauthorized: () =>
    notifications.generic.error(
      "Access denied",
      "You don't have permission to perform this action"
    ),

  // Info patterns
  loading: (message?: string) =>
    notifications.generic.loading(message || "Loading..."),
  info: (message: string, description?: string) =>
    notifications.generic.info(message, description),

  // Warning patterns
  unsavedChanges: () =>
    notifications.generic.warning(
      "You have unsaved changes",
      "Make sure to save before leaving"
    ),
  confirmAction: (action: string) =>
    notifications.generic.warning(
      `Are you sure you want to ${action}?`,
      "This action cannot be undone"
    ),
};

// Async operation wrapper with automatic notifications
export async function withNotifications<T>(
  operation: () => Promise<T>,
  messages: {
    loading?: string;
    success?: string | ((result: T) => string);
    error?: string | ((error: any) => string);
  }
): Promise<T> {
  const loadingToast = messages.loading
    ? notifications.generic.loading(messages.loading)
    : null;

  try {
    const result = await operation();

    if (loadingToast) {
      dismissNotification(loadingToast);
    }

    if (messages.success) {
      const successMessage =
        typeof messages.success === "function"
          ? messages.success(result)
          : messages.success;
      notifications.generic.success(successMessage);
    }

    return result;
  } catch (error) {
    if (loadingToast) {
      dismissNotification(loadingToast);
    }

    if (messages.error) {
      const errorMessage =
        typeof messages.error === "function"
          ? messages.error(error)
          : messages.error;
      notifications.generic.error(errorMessage);
    }

    throw error;
  }
}

// Form submission helper
export async function handleFormSubmission<T>(
  submitFn: () => Promise<T>,
  options: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: T) => void;
    onError?: (error: any) => void;
  } = {}
): Promise<T | null> {
  try {
    return await withNotifications(submitFn, {
      loading: options.loadingMessage || "Submitting...",
      success: options.successMessage || "Form submitted successfully",
      error: options.errorMessage || "Failed to submit form",
    });
  } catch (error) {
    if (options.onError) {
      options.onError(error);
    }
    return null;
  }
}

// API call helper with automatic error handling
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  notificationOptions: {
    showLoading?: boolean;
    showSuccess?: boolean;
    showError?: boolean;
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<T> {
  const {
    showLoading = false,
    showSuccess = false,
    showError = true,
    loadingMessage = "Loading...",
    successMessage = "Request completed successfully",
    errorMessage = "Request failed",
  } = notificationOptions;

  const loadingToast = showLoading
    ? notifications.generic.loading(loadingMessage)
    : null;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (loadingToast) {
      dismissNotification(loadingToast);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (showSuccess) {
      notifications.generic.success(successMessage);
    }

    return data;
  } catch (error) {
    if (loadingToast) {
      dismissNotification(loadingToast);
    }

    if (showError) {
      const message = error instanceof Error ? error.message : errorMessage;
      notifications.generic.error(errorMessage, message);
    }

    throw error;
  }
}

// Clipboard helper
export async function copyToClipboard(
  text: string,
  successMessage: string = "Copied to clipboard"
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    notifications.generic.success(successMessage);
    return true;
  } catch {
    notifications.generic.error("Failed to copy to clipboard");
    return false;
  }
}

// File validation helper
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxSizeMB?: number; // alternative to maxSize
  } = {}
): boolean {
  const {
    maxSize = options.maxSizeMB
      ? options.maxSizeMB * 1024 * 1024
      : 5 * 1024 * 1024,
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  } = options;

  if (file.size > maxSize) {
    notifications.file.fileSizeError();
    return false;
  }

  if (!allowedTypes.includes(file.type)) {
    notifications.file.fileTypeError();
    return false;
  }

  return true;
}

// Batch operation helper
export async function batchOperation<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
  options: {
    batchSize?: number;
    showProgress?: boolean;
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<{ successful: T[]; failed: T[] }> {
  const {
    batchSize = 5,
    showProgress = true,
    successMessage = "Batch operation completed",
    errorMessage = "Some operations failed",
  } = options;

  const successful: T[] = [];
  const failed: T[] = [];
  let processed = 0;

  const progressToast = showProgress
    ? notifications.generic.loading(`Processing 0/${items.length} items...`)
    : null;

  // Process items in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async (item) => {
        try {
          await operation(item);
          successful.push(item);
        } catch {
          failed.push(item);
        } finally {
          processed++;
          if (progressToast) {
            dismissNotification(progressToast);
            if (processed < items.length) {
              notifications.generic.loading(
                `Processing ${processed}/${items.length} items...`
              );
            }
          }
        }
      })
    );
  }

  if (progressToast) {
    dismissNotification(progressToast);
  }

  // Show final result
  if (failed.length === 0) {
    notifications.generic.success(successMessage);
  } else if (successful.length === 0) {
    notifications.generic.error(errorMessage);
  } else {
    notifications.generic.warning(
      "Batch operation partially completed",
      `${successful.length} successful, ${failed.length} failed`
    );
  }

  return { successful, failed };
}

// Debounced notification helper (prevents spam)
const notificationDebounce = new Map<string, NodeJS.Timeout>();

export function debouncedNotify(
  key: string,
  notificationFn: () => void,
  delay: number = 1000
): void {
  // Clear existing timeout
  const existingTimeout = notificationDebounce.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    notificationFn();
    notificationDebounce.delete(key);
  }, delay);

  notificationDebounce.set(key, timeout);
}
