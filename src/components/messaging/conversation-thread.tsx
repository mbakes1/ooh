"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWebSocket } from "@/components/providers/websocket-provider";
import {
  joinConversation,
  leaveConversation,
  markMessageAsRead,
} from "@/lib/websocket/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "./message-composer";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  CheckCheck,
  MoreVertical,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatZAR } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface Participant {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "OWNER" | "ADVERTISER";
}

interface Billboard {
  id: string;
  title: string;
  address: string;
  city: string;
  basePrice: number;
  currency: string;
  images: Array<{
    imageUrl: string;
    altText: string | null;
  }>;
}

interface Conversation {
  id: string;
  billboard: Billboard | null;
  participants: Participant[];
  messages: Message[];
  _count: {
    messages: number;
  };
}

interface ConversationThreadProps {
  conversationId: string;
  onBack?: () => void;
}

export function ConversationThread({
  conversationId,
  onBack,
}: ConversationThreadProps) {
  const { data: session } = useSession();
  const { socket } = useWebSocket();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversation();

    // Join conversation room for real-time updates
    if (socket) {
      joinConversation(conversationId);
    }

    return () => {
      if (socket) {
        leaveConversation(conversationId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, socket]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on("newMessage", (data) => {
        if (data.conversationId === conversationId) {
          setConversation((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: data.id,
                  content: data.content,
                  createdAt: data.createdAt,
                  readAt: null,
                  sender: {
                    id: data.senderId,
                    name: data.senderName,
                    avatarUrl: data.senderAvatar,
                  },
                },
              ],
            };
          });

          // Mark message as read if it's from another user
          if (data.senderId !== session?.user?.id) {
            setTimeout(() => {
              markMessageAsRead(data.id, conversationId);
            }, 1000);
          }
        }
      });

      // Listen for message read receipts
      socket.on("messageRead", (data) => {
        if (data.conversationId === conversationId) {
          setConversation((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === data.messageId
                  ? { ...msg, readAt: data.readAt }
                  : msg
              ),
            };
          });
        }
      });

      // Listen for typing indicators
      socket.on("typing" as any, (data: any) => {
        if (
          data.conversationId === conversationId &&
          data.userId !== session?.user?.id
        ) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });

          // Clear typing indicator after 3 seconds
          if (data.isTyping) {
            setTimeout(() => {
              setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
              });
            }, 3000);
          }
        }
      });

      return () => {
        socket.off("newMessage");
        socket.off("messageRead");
        socket.off("typing" as any);
      };
    }
  }, [socket, conversationId, session?.user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  useEffect(() => {
    // Mark messages as read when conversation is viewed
    if (conversation && session?.user?.id) {
      markAllAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, session?.user?.id]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${conversationId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      const data = await response.json();
      setConversation(data.conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "markAllRead" }),
      });
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Message will be added via WebSocket, no need to refresh
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      // Refresh conversation
      await fetchConversation();
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">
            {error || "Conversation not found"}
          </p>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== session?.user?.id
  );

  return (
    <div className="flex flex-col h-full">
      {/* Modern Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-10 w-10 p-0 hover:bg-muted"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
            )}
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-background shadow-lg">
                <AvatarImage
                  src={otherParticipant?.avatarUrl || ""}
                  alt={otherParticipant?.name || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {otherParticipant?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-background rounded-full shadow-sm"></div>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-xl tracking-tight">
                {otherParticipant?.name}
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    otherParticipant?.role === "OWNER"
                      ? "bg-primary/10 text-primary"
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {otherParticipant?.role === "OWNER"
                    ? "Billboard Owner"
                    : "Advertiser"}
                </div>
                <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Billboard Context */}
        {conversation.billboard && (
          <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              {conversation.billboard.images[0] && (
                <div className="relative">
                  <img
                    src={conversation.billboard.images[0].imageUrl}
                    alt={
                      conversation.billboard.images[0].altText || "Billboard"
                    }
                    className="w-16 h-16 object-cover rounded-xl shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-semibold text-foreground truncate">
                  {conversation.billboard.title}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.billboard.address},{" "}
                  {conversation.billboard.city}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {formatZAR(conversation.billboard.basePrice)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    per month
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                View Details
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-muted/20">
        {conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-6 max-w-sm">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Start the conversation
                </h3>
                <p className="text-muted-foreground">
                  Send your first message to begin discussing this billboard
                  opportunity
                </p>
              </div>
            </div>
          </div>
        ) : (
          conversation.messages.map((message, index) => {
            const isOwn = message.sender.id === session?.user?.id;
            const prevMessage = conversation.messages[index - 1];
            const showAvatar =
              !prevMessage || prevMessage.sender.id !== message.sender.id;
            const isConsecutive =
              prevMessage && prevMessage.sender.id === message.sender.id;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end space-x-3 animate-in",
                  isOwn ? "justify-end" : "justify-start",
                  isConsecutive && "mt-1"
                )}
              >
                {!isOwn && (
                  <div className="w-8 h-8 flex items-end">
                    {showAvatar && (
                      <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                        <AvatarImage
                          src={message.sender.avatarUrl || ""}
                          alt={message.sender.name}
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {message.sender.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[75%] space-y-1",
                    isOwn ? "order-1" : "order-2"
                  )}
                >
                  <div
                    className={cn(
                      "relative px-4 py-3 shadow-sm transition-all duration-200",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md hover:shadow-md"
                        : "bg-card text-card-foreground border rounded-2xl rounded-bl-md hover:shadow-md hover:border-border/80"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      {isOwn && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity shrink-0"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center space-x-2 px-1",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {isOwn && (
                      <div className="flex items-center">
                        {message.readAt ? (
                          <CheckCheck className="h-3 w-3 text-primary" />
                        ) : (
                          <Check className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Composer */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <MessageComposer
          onSend={handleSendMessage}
          disabled={sending}
          sending={sending}
          placeholder={`Message ${otherParticipant?.name}...`}
        />
      </div>
    </div>
  );
}
