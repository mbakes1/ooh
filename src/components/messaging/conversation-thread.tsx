"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWebSocket } from "@/components/providers/websocket-provider";
import {
  joinConversation,
  leaveConversation,
  markMessageAsRead,
} from "@/lib/websocket/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "./message-composer";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck, MoreVertical, Trash2 } from "lucide-react";
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
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-gray-100"
              >
                ←
              </Button>
            )}
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                <img
                  src={otherParticipant?.avatarUrl || "/default-avatar.png"}
                  alt={otherParticipant?.name || "User"}
                  className="rounded-full object-cover"
                />
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {otherParticipant?.name}
              </h3>
              <p className="text-sm text-gray-500">
                {otherParticipant?.role === "OWNER"
                  ? "Billboard Owner"
                  : "Advertiser"}
              </p>
            </div>
          </div>
        </div>

        {/* Billboard Info - Simplified */}
        {conversation.billboard && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-3">
              {conversation.billboard.images[0] && (
                <img
                  src={conversation.billboard.images[0].imageUrl}
                  alt={conversation.billboard.images[0].altText || "Billboard"}
                  className="w-12 h-12 object-cover rounded-lg shadow-sm"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {conversation.billboard.title}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.billboard.address},{" "}
                  {conversation.billboard.city}
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  {formatZAR(conversation.billboard.basePrice)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {conversation.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start the conversation!
            </p>
          </div>
        ) : (
          conversation.messages.map((message) => {
            const isOwn = message.sender.id === session?.user?.id;

            return (
              <div
                key={message.id}
                className={`flex items-end space-x-3 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <img
                      src={message.sender.avatarUrl || "/default-avatar.png"}
                      alt={message.sender.name}
                      className="rounded-full object-cover"
                    />
                  </Avatar>
                )}

                <div className={`max-w-[75%] ${isOwn ? "order-1" : "order-2"}`}>
                  <div
                    className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      {isOwn && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-2 opacity-70 hover:opacity-100 text-white hover:bg-blue-700"
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
                    className={`flex items-center mt-1 space-x-2 ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {isOwn && (
                      <div className="flex items-center">
                        {message.readAt ? (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Check className="h-3 w-3 text-gray-400" />
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

      {/* Message Composer */}
      <div className="border-t bg-white/80 backdrop-blur-sm p-6">
        <MessageComposer
          onSend={handleSendMessage}
          disabled={sending}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
}
