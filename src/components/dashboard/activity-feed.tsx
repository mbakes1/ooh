"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  AlertCircle,
  CheckCircle,
  User,
  Building,
  Activity,
} from "lucide-react";
import { useWebSocket } from "@/components/providers/websocket-provider";

interface ActivityItem {
  id: string;
  type: "message" | "inquiry" | "status_change" | "user_action" | "system";
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  data?: Record<string, unknown>;
}

interface ActivityFeedProps {
  className?: string;
  limit?: number;
}

export function ActivityFeed({ className, limit = 10 }: ActivityFeedProps) {
  const { data: session } = useSession();
  const { socket } = useWebSocket();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const addActivity = useCallback(
    (activity: ActivityItem) => {
      setActivities((prev) => [activity, ...prev.slice(0, limit - 1)]);
    },
    [limit]
  );

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/activities");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();

      // Fetch recent notifications as activities
      const notificationsResponse = await fetch("/api/notifications?limit=10");
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        const notificationActivities: ActivityItem[] =
          notificationsData.notifications.map((notification: any) => ({
            id: `notification-${notification.id}`,
            type: String(notification.type || "system").toLowerCase(),
            title: String(notification.title || "Notification"),
            description: String(notification.message || ""),
            timestamp: notification.createdAt,
            data: notification.data,
          }));

        // Combine and sort activities
        const allActivities = [
          ...(data.activities || []),
          ...notificationActivities,
        ];
        allActivities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(allActivities.slice(0, 20)); // Limit to 20 most recent
      } else {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchActivities();
    }
  }, [session?.user?.id, fetchActivities]);

  useEffect(() => {
    if (socket) {
      // Listen for real-time activity updates
      socket.on("newMessage", (data) => {
        if (data.senderId !== session?.user?.id) {
          addActivity({
            id: `message-${data.id}`,
            type: "message",
            title: "New Message",
            description: `${data.senderName} sent you a message`,
            timestamp: data.createdAt,
            user: {
              id: data.senderId,
              name: data.senderName,
              avatarUrl: data.senderAvatar || undefined,
            },
            data: {
              conversationId: data.conversationId,
              messageId: data.id,
            },
          });
        }
      });

      socket.on("billboardStatusUpdate", (data) => {
        addActivity({
          id: `status-${data.billboardId}-${Date.now()}`,
          type: "status_change",
          title: "Billboard Status Updated",
          description: `Your billboard status changed to ${data.status}`,
          timestamp: data.updatedAt,
          data: {
            billboardId: data.billboardId,
            status: data.status,
          },
        });
      });

      socket.on("notification", (data) => {
        addActivity({
          id: `notification-${data.id}`,
          type: data.type,
          title: data.title,
          description: data.message,
          timestamp: data.createdAt,
          data: data.data,
        });
      });

      return () => {
        socket.off("newMessage");
        socket.off("billboardStatusUpdate");
        socket.off("notification");
      };
    }
  }, [socket, session?.user?.id, addActivity]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "inquiry":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "status_change":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "user_action":
        return <User className="h-4 w-4 text-purple-500" />;
      case "system":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "message":
        return "border-l-blue-500";
      case "inquiry":
        return "border-l-green-500";
      case "status_change":
        return "border-l-orange-500";
      case "user_action":
        return "border-l-purple-500";
      case "system":
        return "border-l-gray-500";
      default:
        return "border-l-gray-300";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
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
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-6">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`p-4 border-l-4 ${getActivityColor(activity.type)} ${
                    index < activities.length - 1 ? "border-b" : ""
                  } hover:bg-muted/50 transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>

                      {activity.user && (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <img
                              src={
                                activity.user.avatarUrl || "/default-avatar.png"
                              }
                              alt={activity.user.name}
                              className="rounded-full"
                            />
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {activity.user.name}
                          </span>
                        </div>
                      )}

                      {activity.data?.billboardTitle &&
                      typeof activity.data.billboardTitle === "string" ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {activity.data.billboardTitle}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
