"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ConversationThread } from "./conversation-thread";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  MessageCircle,
  Users,
  Clock,
  Filter,
  MoreVertical,
  Archive,
  Trash2,
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

interface MessageCenterProps {
  className?: string;
}

export function MessageCenter({ className }: MessageCenterProps) {
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={fetchConversations}>
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Manage your conversations with billboard owners and advertisers
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Conversations</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Unread Messages</p>
                <p className="text-2xl font-bold">
                  {conversations.reduce(
                    (sum, conv) => sum + conv._count.messages,
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Today</p>
                <p className="text-2xl font-bold">
                  {
                    conversations.filter((conv) => {
                      const lastMessage = getLastMessage(conv);
                      if (!lastMessage) return false;
                      const messageDate = new Date(lastMessage.createdAt);
                      const today = new Date();
                      return (
                        messageDate.toDateString() === today.toDateString()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filterBy}
          onValueChange={(value: "all" | "unread" | "archived") =>
            setFilterBy(value)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No conversations found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || filterBy !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start a conversation by inquiring about a billboard"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const lastMessage = getLastMessage(conversation);
            const hasUnread = conversation._count.messages > 0;

            return (
              <Card
                key={conversation.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <img
                        src={
                          otherParticipant?.avatarUrl || "/default-avatar.png"
                        }
                        alt={otherParticipant?.name || "User"}
                        className="rounded-full"
                      />
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold truncate">
                            {otherParticipant?.name}
                          </h3>
                          {hasUnread && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation._count.messages}
                            </Badge>
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
                                className="h-6 w-6 p-0"
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

                      {conversation.billboard && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Re: {conversation.billboard.title}
                        </p>
                      )}

                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          <span className="font-medium">
                            {lastMessage.sender.id === session?.user?.id
                              ? "You: "
                              : ""}
                          </span>
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
