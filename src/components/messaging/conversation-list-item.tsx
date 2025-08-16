"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Archive, CheckCircle2, MoreVertical, Trash2 } from "lucide-react";

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

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
  onArchive,
  onDelete,
}: ConversationListItemProps) {
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId
  );
  const lastMessage = conversation.messages[0]; // API returns messages in desc order
  const hasUnread = conversation._count.messages > 0;

  const isRecentlyActive = (() => {
    if (!lastMessage) return false;
    const messageDate = new Date(lastMessage.createdAt);
    const now = new Date();
    const diffHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  })();

  return (
    <div
      className={cn(
        "group relative p-4 rounded-lg cursor-pointer transition-all duration-200",
        "hover:bg-muted/50 border border-transparent",
        isActive && "bg-accent border-accent-foreground/20",
        hasUnread && !isActive && "bg-primary/5 border-primary/20"
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar with Status */}
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
            <AvatarImage
              src={otherParticipant?.avatarUrl || ""}
              alt={otherParticipant?.name || "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {otherParticipant?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {isRecentlyActive && (
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
                  hasUnread ? "text-foreground" : "text-foreground/90"
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
                {formatDistanceToNow(new Date(conversation.updatedAt), {
                  addSuffix: true,
                })}
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
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive?.(conversation.id);
                    }}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(conversation.id);
                    }}
                  >
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
                Re: {conversation.billboard.title}
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
              {lastMessage.sender.id === currentUserId && (
                <span className="text-muted-foreground mr-1">You:</span>
              )}
              {lastMessage.content}
            </p>
          )}
        </div>

        {/* Read Status */}
        {lastMessage?.sender.id === currentUserId && (
          <div className="flex items-center mt-1">
            <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
