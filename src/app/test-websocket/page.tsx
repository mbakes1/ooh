"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebSocketStatus } from "@/components/websocket-status";

export default function TestWebSocketPage() {
  const { data: session } = useSession();
  const { socket, isConnected, onlineUsers } = useWebSocket();
  const [testMessage, setTestMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [testConversationId] = useState("test-conversation-123");

  useEffect(() => {
    if (socket && isConnected) {
      // Join a test conversation
      socket.emit("joinRoom", { conversationId: testConversationId });

      // Listen for test messages
      const handleNewMessage = (data: any) => {
        setReceivedMessages((prev) => [
          ...prev,
          `${data.senderName}: ${data.content}`,
        ]);
      };

      const handleTyping = (data: any) => {
        if (data.isTyping) {
          setReceivedMessages((prev) => [
            ...prev,
            `👤 User ${data.userId} is typing...`,
          ]);
        } else {
          setReceivedMessages((prev) => [
            ...prev,
            `👤 User ${data.userId} stopped typing`,
          ]);
        }
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("typing", handleTyping);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("typing", handleTyping);
        socket.emit("leaveRoom", { conversationId: testConversationId });
      };
    }
  }, [socket, isConnected, testConversationId]);

  const sendTestMessage = () => {
    if (!testMessage.trim() || !socket || !isConnected) return;

    // Add the message to received messages immediately for testing
    setReceivedMessages((prev) => [...prev, `You: ${testMessage}`]);

    // Emit a test message directly through WebSocket for testing
    if (socket) {
      socket.emit("newMessage", {
        id: `test-${Date.now()}`,
        conversationId: testConversationId,
        content: testMessage,
        senderId: session?.user?.id || "test-user",
        senderName: session?.user?.name || "Test User",
        senderAvatar: session?.user?.image || null,
        createdAt: new Date().toISOString(),
      });
    }

    setTestMessage("");
  };

  const testTyping = () => {
    if (socket && isConnected) {
      console.log("Testing typing indicator...");
      setReceivedMessages((prev) => [
        ...prev,
        "🔄 Testing typing indicator...",
      ]);

      socket.emit("typing", {
        conversationId: testConversationId,
        isTyping: true,
      });

      setTimeout(() => {
        socket.emit("typing", {
          conversationId: testConversationId,
          isTyping: false,
        });
        setReceivedMessages((prev) => [
          ...prev,
          "✅ Typing indicator test completed",
        ]);
      }, 2000);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Please log in to test WebSocket functionality.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">WebSocket Test Page</h1>
        <WebSocketStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>User ID:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {session.user.id}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span>Online Users:</span>
              <Badge variant="outline">{onlineUsers.size}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Test Conversation:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                {testConversationId}
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter test message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendTestMessage()}
              />
              <Button
                onClick={sendTestMessage}
                disabled={!isConnected || !testMessage.trim()}
                className="w-full"
              >
                Send Test Message
              </Button>
            </div>
            <Button
              onClick={testTyping}
              disabled={!isConnected}
              variant="outline"
              className="w-full"
            >
              Test Typing Indicator
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Received Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {receivedMessages.length === 0 ? (
              <p className="text-muted-foreground">
                No messages received yet...
              </p>
            ) : (
              receivedMessages.map((message, index) => (
                <div key={index} className="bg-muted p-2 rounded text-sm">
                  {message}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Make sure you&apos;re running the server with{" "}
              <code className="bg-muted px-1 rounded">npm run dev:custom</code>
            </li>
            <li>Check that the WebSocket status shows &quot;Connected&quot;</li>
            <li>
              Try sending a test message to see if real-time messaging works
            </li>
            <li>
              Open this page in multiple tabs/browsers to test multi-user
              functionality
            </li>
            <li>Test the typing indicator to see real-time status updates</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
