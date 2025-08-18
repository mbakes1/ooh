"use client";

import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "./server";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const initializeWebSocketClient = () => {
  if (socket) {
    return socket;
  }

  // Initialize real WebSocket connection
  socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || window.location.origin, {
    autoConnect: false,
    transports: ["websocket", "polling"], // Prefer websockets, fallback to polling
    upgrade: true,
    rememberUpgrade: true,
    timeout: 20000,
    forceNew: false,
  });

  // Add connection event handlers
  socket.on("connect", () => {
    console.log("✅ WebSocket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ WebSocket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("🔴 WebSocket connection error:", error);
  });

  return socket;
};

export const getWebSocketClient = () => {
  return socket;
};

export const connectWebSocket = (userId?: string) => {
  if (socket && !socket.connected) {
    // Set up authentication handler before connecting
    if (userId) {
      const handleConnect = () => {
        console.log("🔐 Authenticating user:", userId);
        socket.emit("authenticate", { userId });
        socket.off("connect", handleConnect); // Remove this specific handler
      };

      socket.on("connect", handleConnect);
    }

    socket.connect();
  } else if (socket && socket.connected && userId) {
    // If already connected, authenticate immediately
    console.log("🔐 Authenticating already connected user:", userId);
    socket.emit("authenticate", { userId });
  }
};

export const disconnectWebSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

// Helper functions for common operations
export const joinConversation = (conversationId: string) => {
  if (socket) {
    socket.emit("joinRoom", { conversationId });
  }
};

export const leaveConversation = (conversationId: string) => {
  if (socket) {
    socket.emit("leaveRoom", { conversationId });
  }
};

export const markMessageAsRead = (
  messageId: string,
  conversationId: string
) => {
  if (socket) {
    socket.emit("markMessageRead", { messageId, conversationId });
  }
};

export const sendTypingIndicator = (
  conversationId: string,
  isTyping: boolean
) => {
  if (socket) {
    socket.emit("typing", { conversationId, isTyping });
  }
};
