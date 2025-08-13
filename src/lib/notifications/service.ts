import { prisma } from "@/lib/db";
import { emitNotification } from "@/lib/websocket/server";
import { sendPushNotification } from "./push";

export interface CreateNotificationData {
  userId: string;
  type: "MESSAGE" | "INQUIRY" | "STATUS_CHANGE" | "SYSTEM";
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  static async create(notificationData: CreateNotificationData) {
    try {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
        },
      });

      // Send real-time notification via WebSocket
      emitNotification({
        userId: notificationData.userId,
        notification: {
          id: notification.id,
          type: notificationData.type.toLowerCase() as
            | "message"
            | "inquiry"
            | "status_change",
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data,
          createdAt: notification.createdAt,
        },
      });

      // Send push notification if user has subscriptions
      await this.sendPushNotification(notificationData.userId, {
        title: notificationData.title,
        body: notificationData.message,
        data: notificationData.data,
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  static async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const offset = (page - 1) * limit;

    try {
      const where = {
        userId: userId,
        ...(unreadOnly && { read: false }),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: offset,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: userId,
          read: false,
        },
      });

      return count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.delete({
        where: {
          id: notificationId,
          userId: userId,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  private static async sendPushNotification(
    userId: string,
    payload: {
      title: string;
      body: string;
      data?: any;
    }
  ) {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
      });

      if (subscriptions.length === 0) {
        return;
      }

      const pushPromises = subscriptions.map((subscription) =>
        sendPushNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        )
      );

      await Promise.allSettled(pushPromises);
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }

  // Helper methods for common notification types
  static async createMessageNotification(data: {
    recipientId: string;
    senderName: string;
    messageContent: string;
    conversationId: string;
    billboardTitle?: string;
  }) {
    return this.create({
      userId: data.recipientId,
      type: "MESSAGE",
      title: `New message from ${data.senderName}`,
      message:
        data.messageContent.length > 100
          ? `${data.messageContent.substring(0, 100)}...`
          : data.messageContent,
      data: {
        conversationId: data.conversationId,
        billboardTitle: data.billboardTitle,
        senderName: data.senderName,
      },
    });
  }

  static async createInquiryNotification(data: {
    ownerId: string;
    advertiserName: string;
    billboardTitle: string;
    billboardId: string;
    conversationId: string;
  }) {
    return this.create({
      userId: data.ownerId,
      type: "INQUIRY",
      title: `New inquiry from ${data.advertiserName}`,
      message: `${data.advertiserName} is interested in your billboard "${data.billboardTitle}"`,
      data: {
        billboardId: data.billboardId,
        billboardTitle: data.billboardTitle,
        advertiserName: data.advertiserName,
        conversationId: data.conversationId,
      },
    });
  }

  static async createStatusChangeNotification(data: {
    ownerId: string;
    billboardTitle: string;
    billboardId: string;
    oldStatus: string;
    newStatus: string;
  }) {
    const statusMessages = {
      APPROVED: "Your billboard has been approved and is now live!",
      REJECTED: "Your billboard submission has been rejected.",
      SUSPENDED: "Your billboard has been suspended.",
      ACTIVE: "Your billboard is now active.",
      INACTIVE: "Your billboard has been deactivated.",
    };

    return this.create({
      userId: data.ownerId,
      type: "STATUS_CHANGE",
      title: `Billboard Status Update`,
      message: `${data.billboardTitle}: ${statusMessages[data.newStatus as keyof typeof statusMessages] || `Status changed to ${data.newStatus}`}`,
      data: {
        billboardId: data.billboardId,
        billboardTitle: data.billboardTitle,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
      },
    });
  }
}
