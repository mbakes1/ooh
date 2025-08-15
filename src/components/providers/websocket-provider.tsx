"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { Socket } from "socket.io-client";
// WebSocket client imports removed - using placeholder implementation
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/lib/websocket/server";

interface WebSocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
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

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // For development, simulate WebSocket connection
      console.log("Initializing real-time features...");
      setIsConnected(true);

      // Create a mock socket object for compatibility
      const mockSocket = {
        on: () => {
          // Store event listeners for future use
        },
        off: () => {
          // Remove event listeners
        },
        emit: () => {
          // Handle emit events
        },
      } as unknown as Socket<ServerToClientEvents, ClientToServerEvents>;

      setSocket(mockSocket);

      return () => {
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      };
    }
  }, [session, status]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </WebSocketContext.Provider>
  );
}
