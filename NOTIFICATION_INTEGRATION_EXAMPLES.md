# Notification Integration Examples

This document provides practical examples of how to integrate notifications into existing components.

## Quick Integration Examples

### 1. Simple Form Submission

**Before:**

```typescript
const handleSubmit = async (data) => {
  try {
    await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // No user feedback
  } catch (error) {
    console.error(error);
    // No user feedback
  }
};
```

**After:**

```typescript
import { quickNotify } from "@/lib/notification-helpers";

const handleSubmit = async (data) => {
  const loadingToast = quickNotify.loading("Submitting form...");
  try {
    await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
    quickNotify.saved();
  } catch (error) {
    quickNotify.saveFailed(error.message);
  }
};
```

### 2. File Upload with Validation

**Before:**

```typescript
const handleFileUpload = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    alert("File too large");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    alert("Upload failed");
  }
};
```

**After:**

```typescript
import { validateFile, withNotifications } from "@/lib/notification-helpers";

const handleFileUpload = async (file) => {
  if (!validateFile(file)) {
    return; // Validation notifications handled automatically
  }

  const formData = new FormData();
  formData.append("file", file);

  await withNotifications(
    () => fetch("/api/upload", { method: "POST", body: formData }),
    {
      loading: `Uploading ${file.name}...`,
      success: `${file.name} uploaded successfully`,
      error: "Upload failed",
    }
  );
};
```

### 3. API Data Fetching

**Before:**

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**After:**

```typescript
import { apiCall } from "@/lib/notification-helpers";

const fetchData = async () => {
  try {
    const data = await apiCall(
      "/api/data",
      {},
      {
        showLoading: true,
        showError: true,
        loadingMessage: "Loading data...",
        errorMessage: "Failed to load data",
      }
    );
    setData(data);
  } catch (error) {
    // Error notification already shown
  }
};
```

### 4. Copy to Clipboard

**Before:**

```typescript
const handleCopy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // No feedback
  } catch (error) {
    // No feedback
  }
};
```

**After:**

```typescript
import { copyToClipboard } from "@/lib/notification-helpers";

const handleCopy = async (text) => {
  await copyToClipboard(text, "Link copied to clipboard");
};
```

## Component-Specific Examples

### Authentication Components

```typescript
// Login Form
import { useAuthNotifications } from "@/hooks/use-notifications";

const LoginForm = () => {
  const authNotifications = useAuthNotifications();

  const handleLogin = async (credentials) => {
    try {
      const result = await signIn("credentials", credentials);
      if (result?.error) {
        authNotifications.loginError(result.error);
      } else {
        authNotifications.loginSuccess(credentials.email);
      }
    } catch (error) {
      authNotifications.loginError("An unexpected error occurred");
    }
  };
};
```

### Billboard Management

```typescript
// Billboard Creation
import { useBillboardNotifications } from "@/hooks/use-notifications";

const BillboardForm = () => {
  const billboardNotifications = useBillboardNotifications();

  const handleCreate = async (data) => {
    try {
      await createBillboard(data);
      billboardNotifications.createSuccess(data.name);
      router.push("/dashboard/billboards");
    } catch (error) {
      billboardNotifications.createError(error.message);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await deleteBillboard(id);
      billboardNotifications.deleteSuccess(name);
    } catch (error) {
      billboardNotifications.deleteError(error.message);
    }
  };
};
```

### Messaging System

```typescript
// Message Composer
import { useMessageNotifications } from "@/hooks/use-notifications";

const MessageComposer = () => {
  const messageNotifications = useMessageNotifications();

  const handleSend = async (content) => {
    try {
      await sendMessage(content);
      messageNotifications.sendSuccess();
      setContent("");
    } catch (error) {
      messageNotifications.sendError(error.message);
    }
  };
};
```

### Admin Panel

```typescript
// User Management
import { useAdminNotifications } from "@/hooks/use-notifications";

const UserManagement = () => {
  const adminNotifications = useAdminNotifications();

  const handlePromoteUser = async (userId, userName) => {
    try {
      await promoteUser(userId);
      adminNotifications.userPromoted(userName);
    } catch (error) {
      // Handle error
    }
  };

  const handleBanUser = async (userId, userName) => {
    try {
      await banUser(userId);
      adminNotifications.userBanned(userName);
    } catch (error) {
      // Handle error
    }
  };
};
```

## Advanced Patterns

### 1. Batch Operations with Progress

```typescript
import { batchOperation } from "@/lib/notification-helpers";

const handleBulkDelete = async (items) => {
  const { successful, failed } = await batchOperation(
    items,
    async (item) => {
      await deleteItem(item.id);
    },
    {
      batchSize: 3,
      showProgress: true,
      successMessage: "All items deleted successfully",
      errorMessage: "Some items could not be deleted",
    }
  );

  // Handle results
  if (failed.length > 0) {
    console.log("Failed items:", failed);
  }
};
```

### 2. Debounced Notifications

```typescript
import { debouncedNotify } from "@/lib/notification-helpers";

const handleSearch = (query) => {
  // Prevent notification spam during typing
  debouncedNotify(
    "search-notification",
    () => quickNotify.info(`Searching for "${query}"`),
    500
  );

  performSearch(query);
};
```

### 3. Promise-based Operations

```typescript
import { useNotifications } from "@/hooks/use-notifications";

const DataProcessor = () => {
  const { promise } = useNotifications();

  const handleProcess = () => {
    const operation = processLargeDataset();

    promise(operation, {
      loading: "Processing dataset...",
      success: (result) => `Processed ${result.count} records`,
      error: (error) => `Processing failed: ${error.message}`,
    });
  };
};
```

### 4. Connection Status Integration

```typescript
import { useSystemNotifications } from "@/hooks/use-notifications";

const useConnectionStatus = () => {
  const systemNotifications = useSystemNotifications();

  useEffect(() => {
    const handleOnline = () => {
      systemNotifications.connectionRestored();
    };

    const handleOffline = () => {
      systemNotifications.connectionLost();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [systemNotifications]);
};
```

## Migration Guide

### Step 1: Install Dependencies (Already Done)

- Sonner is already installed and configured

### Step 2: Import Notifications

```typescript
// For simple cases
import { quickNotify } from "@/lib/notification-helpers";

// For specific categories
import { useBillboardNotifications } from "@/hooks/use-notifications";

// For full control
import { useNotifications } from "@/hooks/use-notifications";
```

### Step 3: Replace Existing Feedback

- Replace `alert()` calls with appropriate notifications
- Replace console.error with error notifications
- Add success notifications for positive actions
- Add loading states for async operations

### Step 4: Test Integration

- Visit `/demo/notifications` to see all available notifications
- Test your integrated components
- Verify accessibility with screen readers
- Check mobile responsiveness

## Best Practices

### 1. Choose the Right Notification Type

- **Success**: Completed actions (save, create, delete)
- **Error**: Failed operations, validation errors
- **Warning**: Potentially destructive actions, unsaved changes
- **Info**: Status updates, helpful information
- **Loading**: Long-running operations

### 2. Provide Context

```typescript
// Good
notifications.billboard.createSuccess("Times Square Billboard");

// Better
notifications.billboard.createSuccess(
  "Times Square Billboard",
  "Your billboard is now live and available for booking"
);
```

### 3. Handle Edge Cases

```typescript
const handleAction = async () => {
  try {
    await performAction();
    notifications.generic.success("Action completed");
  } catch (error) {
    if (error.status === 401) {
      notifications.auth.sessionExpired();
    } else if (error.status === 403) {
      notifications.generic.error("Access denied");
    } else {
      notifications.generic.error("Action failed", error.message);
    }
  }
};
```

### 4. Avoid Notification Spam

```typescript
// Use debouncing for frequent actions
debouncedNotify(
  "save-draft",
  () => {
    notifications.generic.info("Draft saved");
  },
  1000
);
```

This integration guide should help you add comprehensive notifications to any component in your application quickly and consistently.
