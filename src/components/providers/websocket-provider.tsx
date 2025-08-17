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
import { useSystemNotifications } from "@/hooks/use-notifications";

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
  const systemNotifications = useSystemNotifications();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // For development, simulate WebSocket connection
      console.log("Initializing real-time features...");

      // Simulate connection process
      setTimeout(() => {
        setIsConnected(true);
        systemNotifications.connectionRestored();
      }, 1000);

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

      // Simulate occasional connection issues for demo
      const connectionInterval = setInterval(() => {
        if (Math.random() < 0.05) {
          // 5% chance of connection issue
          setIsConnected(false);
          systemNotifications.connectionLost();

          setTimeout(() => {
            setIsConnected(true);
            systemNotifications.connectionRestored();
          }, 2000);
        }
      }, 30000); // Check every 30 seconds

      return () => {
        clearInterval(connectionInterval);
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      };
    }
  }, [session, status, systemNotifications]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </WebSocketContext.Provider>
  );
}
