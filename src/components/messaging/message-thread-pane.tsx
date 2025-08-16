"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConversationThread } from "./conversation-thread";
import { ArrowLeft, Archive, MessageCircle, Reply, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface Conversation {
  id: string;
  billboard: Billboard | null;
  participants: Participant[];
}

interface MessageThreadPaneProps {
  conversationId: string | null;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function MessageThreadPane({
  conversationId,
  onBack,
  showBackButton = false,
  className,
}: MessageThreadPaneProps) {
  const { data: session } = useSession();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const fetchConversationDetails = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      }
    } catch (error) {
      console.error("Failed to fetch conversation details:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails();
    }
  }, [conversationId, fetchConversationDetails]);

  if (!conversationId) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Select a conversation</h3>
            <p className="text-muted-foreground">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation?.participants.find(
    (p) => p.id !== session?.user?.id
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Enhanced Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-10 w-10 p-0 hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            {otherParticipant && (
              <>
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                  <AvatarImage
                    src={otherParticipant.avatarUrl || ""}
                    alt={otherParticipant.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {otherParticipant.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{otherParticipant.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {otherParticipant.role === "OWNER"
                      ? "Billboard Owner"
                      : "Advertiser"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Reply className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reply</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Archive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Archive</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Mute Thread Control */}
        <div className="flex items-center space-x-2">
          <Switch
            id="mute-thread"
            checked={isMuted}
            onCheckedChange={setIsMuted}
          />
          <Label htmlFor="mute-thread" className="text-sm">
            Mute this thread
          </Label>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-hidden">
        <ConversationThread
          conversationId={conversationId}
          onBack={showBackButton ? onBack : undefined}
          showHeader={false}
        />
      </div>
    </div>
  );
}
