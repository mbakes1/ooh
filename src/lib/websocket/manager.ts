import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { prisma } from "@/lib/db";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./server";

let io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export const getWebSocketServer = () => {
  // Try to get the global io instance first
  if (typeof global !== "undefined" && global.io) {
    return global.io;
  }
  return io;
};

export const setWebSocketServer = (
  server: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) => {
  io = server;
};

// Helper functions to emit events
export const emitNewMessage = (data: {
  conversationId: string;
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar: string | null;
    createdAt: Date;
  };
}) => {
  const socketServer = getWebSocketServer();
  if (!socketServer) {
    console.log("⚠️ WebSocket server not initialized, message not sent");
    return;
  }

  console.log("📤 Emitting new message to conversation:", data.conversationId);
  socketServer.to(`conversation:${data.conversationId}`).emit("newMessage", {
    id: data.message.id,
    conversationId: data.conversationId,
    content: data.message.content,
    senderId: data.message.senderId,
    senderName: data.message.senderName,
    senderAvatar: data.message.senderAvatar,
    createdAt: data.message.createdAt.toISOString(),
  });
};

export const emitBillboardStatusUpdate = (data: {
  billboardId: string;
  ownerId: string;
  status: string;
  updatedAt: Date;
}) => {
  const socketServer = getWebSocketServer();
  if (!socketServer) {
    console.log("⚠️ WebSocket server not initialized, status update not sent");
    return;
  }

  console.log("📤 Emitting billboard status update to user:", data.ownerId);
  socketServer.to(`user:${data.ownerId}`).emit("billboardStatusUpdate", {
    billboardId: data.billboardId,
    status: data.status,
    updatedAt: data.updatedAt.toISOString(),
  });
};

export const emitNotification = (data: {
  userId: string;
  notification: {
    id: string;
    type: "message" | "inquiry" | "status_change";
    title: string;
    message: string;
    data?: any;
    createdAt: Date;
  };
}) => {
  const socketServer = getWebSocketServer();
  if (!socketServer) {
    console.log("⚠️ WebSocket server not initialized, notification not sent");
    return;
  }

  console.log("📤 Emitting notification to user:", data.userId);
  socketServer.to(`user:${data.userId}`).emit("notification", {
    id: data.notification.id,
    type: data.notification.type,
    title: data.notification.title,
    message: data.notification.message,
    data: data.notification.data,
    createdAt: data.notification.createdAt.toISOString(),
  });
};
