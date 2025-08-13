"use client";

import { useState, useEffect } from "react";
import { PushNotificationService } from "@/lib/notifications/push-client";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const pushService = PushNotificationService.getInstance();

  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        setIsLoading(true);

        // Check if push notifications are supported
        const supported = await pushService.initialize();
        setIsSupported(supported);

        if (supported) {
          // Get current permission status
          const currentPermission = pushService.getPermissionStatus();
          setPermission(currentPermission);

          // Check if already subscribed
          const subscribed = await pushService.isSubscribed();
          setIsSubscribed(subscribed);
        }
      } catch (error) {
        console.error("Error initializing push notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePushNotifications();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const newPermission = await pushService.requestPermission();
      setPermission(newPermission);
      return newPermission === "granted";
    } catch (error) {
      console.error("Error requesting permission:", error);
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    try {
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }

      const success = await pushService.subscribe();
      if (success) {
        setIsSubscribed(true);
      }
      return success;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const success = await pushService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
      }
      return success;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  };

  const showLocalNotification = async (
    title: string,
    options?: NotificationOptions
  ): Promise<void> => {
    try {
      await pushService.showLocalNotification(title, options);
    } catch (error) {
      console.error("Error showing local notification:", error);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
  };
}
