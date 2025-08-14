"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { Bell, BellOff, Smartphone, AlertCircle } from "lucide-react";

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(isSubscribed);

  useEffect(() => {
    setPushNotifications(isSubscribed);
  }, [isSubscribed]);

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await subscribe();
      if (success) {
        setPushNotifications(true);
      }
    } else {
      const success = await unsubscribe();
      if (success) {
        setPushNotifications(false);
      }
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge variant="default" className="bg-green-500">
            Granted
          </Badge>
        );
      case "denied":
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">Not Requested</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notification Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label
                htmlFor="email-notifications"
                className="text-sm font-medium"
              >
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications via email for messages and updates
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label
                htmlFor="push-notifications"
                className="text-sm font-medium flex items-center space-x-2"
              >
                <Smartphone className="h-4 w-4" />
                <span>Push Notifications</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive real-time notifications on this device
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={handlePushToggle}
              disabled={!isSupported || permission === "denied"}
            />
          </div>

          {/* Push Notification Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Browser Support:</span>
              <Badge variant={isSupported ? "default" : "secondary"}>
                {isSupported ? "Supported" : "Not Supported"}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Permission Status:</span>
              {getPermissionBadge()}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Subscription Status:
              </span>
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {isSubscribed ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Help Text */}
          {!isSupported && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Push notifications not supported</p>
                <p>
                  Your browser doesn&apos;t support push notifications.
                  You&apos;ll still receive email notifications.
                </p>
              </div>
            </div>
          )}

          {permission === "denied" && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <BellOff className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Push notifications blocked</p>
                <p>
                  You&apos;ve blocked notifications for this site. To enable
                  them, click the lock icon in your browser&apos;s address bar
                  and allow notifications.
                </p>
              </div>
            </div>
          )}

          {permission === "default" && isSupported && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Enable push notifications to receive real-time updates
              </p>
              <Button variant="outline" size="sm" onClick={requestPermission}>
                Enable
              </Button>
            </div>
          )}
        </div>

        {/* Test Notification */}
        {isSubscribed && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Test local notification
                if (
                  "Notification" in window &&
                  Notification.permission === "granted"
                ) {
                  new Notification("Test Notification", {
                    body: "Push notifications are working correctly!",
                    icon: "/icons/icon-192x192.png",
                  });
                }
              }}
            >
              Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
