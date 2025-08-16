"use client";

import { useState, useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ConversationListPane } from "./conversation-list-pane";
import { MessageThreadPane } from "./message-thread-pane";
import { MessageCircle } from "lucide-react";
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchConversations();

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
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

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

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
          <button onClick={fetchConversations} className="w-full">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Mobile view - show single pane
  if (isMobile) {
    if (selectedConversationId) {
      return (
        <div className={cn("h-full", className)}>
          <MessageThreadPane
            conversationId={selectedConversationId}
            onBack={handleBackToList}
            showBackButton={true}
          />
        </div>
      );
    }

    return (
      <div className={cn("h-full", className)}>
        <ConversationListPane
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          loading={loading}
        />
      </div>
    );
  }

  // Desktop view - two-pane layout
  return (
    <div className={cn("h-full", className)}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
          <ConversationListPane
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={50}>
          <MessageThreadPane
            conversationId={selectedConversationId}
            onBack={handleBackToList}
            showBackButton={false}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
