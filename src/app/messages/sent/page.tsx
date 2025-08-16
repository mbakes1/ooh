"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SentMessage {
  id: string;
  content: string;
  createdAt: string;
  conversation: {
    id: string;
    billboard?: {
      title: string;
    };
    participants: Array<{
      id: string;
      name: string;
    }>;
  };
}

export default function SentMessagesPage() {
  const { data: session, status } = useSession();
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
    if (status === "authenticated") {
      fetchSentMessages();
    }
  }, [status]);

  const fetchSentMessages = async () => {
    try {
      const response = await fetch("/api/messages/sent");
      if (response.ok) {
        const data = await response.json();
        setSentMessages(data.messages || []);
      } else {
        throw new Error("Failed to fetch sent messages");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getRecipient = (message: SentMessage) => {
    return message.conversation.participants.find(
      (p) => p.id !== session?.user?.id
    );
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Messages", href: "/messages" },
          { label: "Sent" },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Messages", href: "/messages" },
        { label: "Sent" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/messages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inbox
            </Link>
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchSentMessages}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : sentMessages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sent messages</h3>
              <p className="text-muted-foreground">
                Messages you send will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sentMessages.map((message) => {
              const recipient = getRecipient(message);
              return (
                <Card
                  key={message.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">
                        {message.conversation.billboard?.title ||
                          "Direct Message"}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      To: {recipient?.name || "Unknown"}
                    </p>
                    <p className="text-sm line-clamp-2">{message.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
