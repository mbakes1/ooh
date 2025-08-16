"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationThread } from "./conversation-thread";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  MessageCircle,
  Filter,
  MoreVertical,
  Archive,
  Trash2,
  Plus,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

interface Participant {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Billboard {
  id: string;
  title: string;
  address: string;
  city: string;
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
  updatedAt: string;
}

interface MessageCenterRefinedProps {
  className?: string;
}

export function MessageCenterRefined({ className }: MessageCenterRefinedProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "unread" | "archived">(
    "all"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const otherParticipant = conversation.participants.find(
        (p) => p.id !== session?.user?.id
      );
      const matchesParticipant = otherParticipant?.name
        .toLowerCase()
        .includes(query);
      const matchesBillboard = conversation.billboard?.title
        .toLowerCase()
        .includes(query);
      const matchesLastMessage = conversation.messages[0]?.content
        .toLowerCase()
        .includes(query);

      if (!matchesParticipant && !matchesBillboard && !matchesLastMessage) {
        return false;
      }
    }

    // Status filter
    if (filterBy === "unread") {
      return conversation._count.messages > 0;
    }

    // For now, we don't have archived conversations
    if (filterBy === "archived") {
      return false;
    }

    return true;
  });

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== session?.user?.id);
  };

  const getLastMessage = (conversation: Conversation) => {
    return conversation.messages[0]; // API returns messages in desc order, so first is latest
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto"></div>
            <MessageCircle className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Loading conversations</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we fetch your messages
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Unable to load messages</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchConversations} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (selectedConversationId) {
    return (
      <ConversationThread
        conversationId={selectedConversationId}
        onBack={() => setSelectedConversationId(null)}
      />
    );
  }

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv._count.messages,
    0
  );
  const activeToday = conversations.filter((conv) => {
    const lastMessage = getLastMessage(conv);
    if (!lastMessage) return false;
    const messageDate = new Date(lastMessage.createdAt);
    const today = new Date();
    return messageDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Modern Header with Quick Stats */}
      <div className="flex flex-col space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Connect with billboard owners and advertisers
            </p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="font-medium">{conversations.length}</span>
            <span className="text-muted-foreground">conversations</span>
          </div>
          {totalUnread > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
              <span className="font-medium text-destructive">
                {totalUnread}
              </span>
              <span className="text-muted-foreground">unread</span>
            </div>
          )}
          {activeToday > 0 && (
            <div className="flex items-center gap-2">
              <Clock3 className="h-3 w-3 text-green-600" />
              <span className="font-medium text-green-600">{activeToday}</span>
              <span className="text-muted-foreground">active today</span>
            </div>
          )}
        </div>

        {/* Enhanced Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations, people, or billboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filterBy}
              onValueChange={(value: "all" | "unread" | "archived") =>
                setFilterBy(value)
              }
            >
              <SelectTrigger className="w-[140px] h-11">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {searchQuery || filterBy !== "all"
                    ? "No matches found"
                    : "No conversations yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterBy !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for"
                    : "Start connecting with billboard owners and advertisers by browsing available listings"}
                </p>
              </div>
              {!searchQuery && filterBy === "all" && (
                <Button className="w-full">Browse Billboards</Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const lastMessage = getLastMessage(conversation);
              const hasUnread = conversation._count.messages > 0;
              const isActive = (() => {
                if (!lastMessage) return false;
                const messageDate = new Date(lastMessage.createdAt);
                const now = new Date();
                const diffHours =
                  (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
                return diffHours < 24;
              })();

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative p-4 rounded-xl cursor-pointer transition-all duration-200",
                    "hover:bg-muted/50 hover:shadow-sm",
                    "border border-transparent hover:border-border/50",
                    hasUnread && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar with Status */}
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                        <AvatarImage
                          src={otherParticipant?.avatarUrl || ""}
                          alt={otherParticipant?.name || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {otherParticipant?.name?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3
                            className={cn(
                              "font-semibold truncate",
                              hasUnread
                                ? "text-foreground"
                                : "text-foreground/90"
                            )}
                          >
                            {otherParticipant?.name}
                          </h3>
                          {hasUnread && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20"
                              >
                                {conversation._count.messages}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(conversation.updatedAt),
                              { addSuffix: true }
                            )}
                          </span>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Billboard Context */}
                      {conversation.billboard && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                          <span className="truncate">
                            {conversation.billboard.title}
                          </span>
                        </div>
                      )}

                      {/* Last Message */}
                      {lastMessage && (
                        <p
                          className={cn(
                            "text-sm truncate",
                            hasUnread
                              ? "text-foreground/80 font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {lastMessage.sender.id === session?.user?.id && (
                            <span className="text-muted-foreground mr-1">
                              You:
                            </span>
                          )}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Read Status */}
                    {lastMessage?.sender.id === session?.user?.id && (
                      <div className="flex items-center mt-1">
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
