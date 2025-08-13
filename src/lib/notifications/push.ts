import webpush from "web-push";

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@billboard-marketplace.co.za",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<void> {
  try {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      image: payload.image,
      data: payload.data || {},
      actions: payload.actions || [],
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      timestamp: Date.now(),
    });

    const options = {
      TTL: 24 * 60 * 60, // 24 hours
      urgency: "normal" as const,
    };

    await webpush.sendNotification(subscription, pushPayload, options);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

export function generateVAPIDKeys() {
  return webpush.generateVAPIDKeys();
}

export function getPublicVAPIDKey(): string {
  return process.env.VAPID_PUBLIC_KEY || "";
}
