"use client";

import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "./server";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const initializeWebSocketClient = () => {
  if (socket) {
    return socket;
  }

  // For development, we'll use a mock socket that uses polling
  socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || window.location.origin, {
    autoConnect: false,
    transports: ["polling"], // Use polling instead of websockets for now
  });

  return socket;
};

export const getWebSocketClient = () => {
  return socket;
};

export const connectWebSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
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
