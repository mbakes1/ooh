"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationListItem } from "./conversation-list-item";
import { Search } from "lucide-react";
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

interface ConversationListPaneProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading?: boolean;
  className?: string;
}

export function ConversationListPane({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading = false,
  className,
}: ConversationListPaneProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "unread">("all");

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

    return true;
  });

  if (loading) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="p-4 border-b">
          <div className="h-6 bg-muted rounded animate-pulse mb-4"></div>
          <div className="h-10 bg-muted rounded animate-pulse mb-3"></div>
          <div className="h-8 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3">
              <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="text-lg font-semibold mb-4">Inbox</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <Tabs
          value={filterBy}
          onValueChange={(value) => setFilterBy(value as "all" | "unread")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All mail</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  {searchQuery || filterBy !== "all"
                    ? "No conversations match your filters"
                    : "No conversations yet"}
                </p>
                {!searchQuery && filterBy === "all" && (
                  <p className="text-sm text-muted-foreground">
                    Start browsing billboards to connect with owners
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={selectedConversationId === conversation.id}
                  currentUserId={session?.user?.id || ""}
                  onClick={() => onSelectConversation(conversation.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
