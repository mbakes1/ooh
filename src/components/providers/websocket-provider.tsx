"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
import {
  initializeWebSocketClient,
  connectWebSocket,
  disconnectWebSocket,
} from "@/lib/websocket/client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/lib/websocket/server";

interface WebSocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  joinConversation: () => {},
  leaveConversation: () => {},
});

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const joinConversation = useCallback(
    (conversationId: string) => {
      if (socket && isConnected) {
        socket.emit("joinRoom", { conversationId });
      }
    },
    [socket, isConnected]
  );

  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (socket && isConnected) {
        socket.emit("leaveRoom", { conversationId });
      }
    },
    [socket, isConnected]
  );

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      console.log(
        "🚀 Initializing WebSocket connection for user:",
        session.user.id
      );

      // Initialize the WebSocket client
      const socketInstance = initializeWebSocketClient();
      setSocket(socketInstance);

      // Set up event listeners
      const handleConnect = () => {
        console.log("✅ WebSocket connected successfully");
        setIsConnected(true);
      };

      const handleDisconnect = (reason: string) => {
        console.log("❌ WebSocket disconnected:", reason);
        setIsConnected(false);
      };

      const handleUserOnline = ({ userId }: { userId: string }) => {
        setOnlineUsers((prev) => new Set(prev).add(userId));
      };

      const handleUserOffline = ({ userId }: { userId: string }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      };

      const handleConnectError = (error: Error) => {
        console.error("🔴 WebSocket connection error:", error);
        setIsConnected(false);
      };

      // Attach event listeners
      socketInstance.on("connect", handleConnect);
      socketInstance.on("disconnect", handleDisconnect);
      socketInstance.on("userOnline", handleUserOnline);
      socketInstance.on("userOffline", handleUserOffline);
      socketInstance.on("connect_error", handleConnectError);

      // Connect the socket with user authentication
      connectWebSocket(session.user.id);

      // Cleanup function
      return () => {
        console.log("🧹 Cleaning up WebSocket connection...");

        // Remove event listeners
        socketInstance.off("connect", handleConnect);
        socketInstance.off("disconnect", handleDisconnect);
        socketInstance.off("userOnline", handleUserOnline);
        socketInstance.off("userOffline", handleUserOffline);
        socketInstance.off("connect_error", handleConnectError);

        // Disconnect the socket
        disconnectWebSocket();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      };
    } else if (status === "unauthenticated") {
      // Clean up if user is not authenticated
      if (socket) {
        disconnectWebSocket();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
    }
  }, [session?.user?.id, status]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        joinConversation,
        leaveConversation,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
