"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatSASTTime } from "@/lib/utils";

interface NotificationData {
  id: string;
  type: "new_message" | "new_conversation";
  title: string;
  message: string;
  senderName: string;
  senderAvatar?: string;
  conversationId: string;
  timestamp: string;
}

interface MessageNotificationsProps {
  onNotificationClick?: (conversationId: string) => void;
}

export function MessageNotifications({
  onNotificationClick,
}: MessageNotificationsProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    if (!session?.user?.id) return;

    // Check for new messages periodically
    const interval = setInterval(checkForNewMessages, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, lastChecked]);

  const checkForNewMessages = async () => {
    try {
      const response = await fetch(
        `/api/conversations?since=${lastChecked.toISOString()}`
      );

      if (!response.ok) return;

      const data = await response.json();
      const conversations = data.conversations || [];

      // Find conversations with new messages
      const newNotifications: NotificationData[] = [];

      conversations.forEach(
        (conv: {
          id: string;
          messages: Array<{
            id: string;
            senderId: string;
            content: string;
            createdAt: string;
          }>;
          participants: Array<{ id: string; name: string; avatarUrl?: string }>;
        }) => {
          const lastMessage = conv.messages[0];
          if (
            lastMessage &&
            lastMessage.senderId !== session?.user?.id &&
            new Date(lastMessage.createdAt) > lastChecked
          ) {
            const otherParticipant = conv.participants.find(
              (p) => p.id !== session?.user?.id
            );

            newNotifications.push({
              id: `${conv.id}-${lastMessage.id}`,
              type: "new_message",
              title: `New message from ${otherParticipant?.name}`,
              message: lastMessage.content.substring(0, 100),
              senderName: otherParticipant?.name || "Unknown",
              senderAvatar: otherParticipant?.avatarUrl,
              conversationId: conv.id,
              timestamp: lastMessage.createdAt,
            });
          }
        }
      );

      // Show toast notifications for new messages
      newNotifications.forEach((notification) => {
        toast(notification.title, {
          description: notification.message,
          action: {
            label: "View",
            onClick: () => onNotificationClick?.(notification.conversationId),
          },
          duration: 5000,
        });
      });

      setNotifications((prev) => [...newNotifications, ...prev].slice(0, 10)); // Keep last 10
      setLastChecked(new Date());
    } catch (error) {
      console.error("Failed to check for new messages:", error);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (
    conversationId: string,
    notificationId: string
  ) => {
    dismissNotification(notificationId);
    onNotificationClick?.(conversationId);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <Card
          key={notification.id}
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-primary"
          onClick={() =>
            handleNotificationClick(
              notification.conversationId,
              notification.id
            )
          }
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <img
                  src={notification.senderAvatar || "/default-avatar.png"}
                  alt={notification.senderName}
                  className="rounded-full"
                />
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold truncate">
                    {notification.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>

                <div className="flex items-center mt-2">
                  <MessageCircle className="h-3 w-3 text-primary mr-1" />
                  <span className="text-xs text-muted-foreground">
                    {formatSASTTime(new Date(notification.timestamp))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {notifications.length > 3 && (
        <Card className="text-center">
          <CardContent className="p-2">
            <p className="text-xs text-muted-foreground">
              +{notifications.length - 3} more notifications
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
