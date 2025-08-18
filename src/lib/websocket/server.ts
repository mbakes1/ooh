import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "@/lib/db";

export interface ServerToClientEvents {
  newMessage: (data: {
    id: string;
    conversationId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar: string | null;
    createdAt: string;
  }) => void;
  messageRead: (data: {
    messageId: string;
    conversationId: string;
    readAt: string;
  }) => void;
  billboardStatusUpdate: (data: {
    billboardId: string;
    status: string;
    updatedAt: string;
  }) => void;
  notification: (data: {
    id: string;
    type: "message" | "inquiry" | "status_change";
    title: string;
    message: string;
    data?: any;
    createdAt: string;
  }) => void;
  userOnline: (data: { userId: string }) => void;
  userOffline: (data: { userId: string }) => void;
  typing: (data: { userId: string; conversationId: string; isTyping: boolean }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: { conversationId: string }) => void;
  leaveRoom: (data: { conversationId: string }) => void;
  markMessageRead: (data: {
    messageId: string;
    conversationId: string;
  }) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
  newMessage: (data: {
    id: string;
    conversationId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar: string | null;
    createdAt: string;
  }) => void;
  authenticate: (data: { userId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userEmail: string;
  userName?: string;
}

let io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export const initializeWebSocket = (server: HTTPServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL?.split(",") || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Store online users
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.use(async (socket, next) => {
    try {
      // Get the user ID from the handshake auth (simplified approach)
      const userId = socket.handshake.auth.userId;

      if (!userId) {
        return next(new Error("User ID required"));
      }

      // Get user from database to verify they exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.userId = user.id;
      socket.data.userEmail = user.email!;
      socket.data.userName = user.name;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id, "User:", socket.data.userId);

    // Track online user
    onlineUsers.set(socket.data.userId, socket.id);
    socket.broadcast.emit("userOnline", { userId: socket.data.userId });

    console.log(`User ${socket.data.userId} connected`);

    // Join user to their personal room for notifications
    socket.join(`user:${socket.data.userId}`);

    // Handle joining conversation rooms
    socket.on("joinRoom", async ({ conversationId }) => {
      try {
        // Verify user is part of the conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            participants: {
              some: {
                id: socket.data.userId,
              },
            },
          },
        });

        if (conversation) {
          socket.join(`conversation:${conversationId}`);
          console.log(
            `User ${socket.data.userId} joined conversation ${conversationId}`
          );
        }
      } catch (error) {
        console.error("Error joining room:", error);
      }
    });

    // Handle leaving conversation rooms
    socket.on("leaveRoom", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(
        `User ${socket.data.userId} left conversation ${conversationId}`
      );
    });

    // Handle marking messages as read
    socket.on("markMessageRead", async ({ messageId, conversationId }) => {
      try {
        const message = await prisma.message.update({
          where: {
            id: messageId,
            recipientId: socket.data.userId,
          },
          data: {
            readAt: new Date(),
          },
        });

        // Notify the sender that their message was read
        socket.to(`conversation:${conversationId}`).emit("messageRead", {
          messageId,
          conversationId,
          readAt: message.readAt!.toISOString(),
        });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit("typing" as any, {
        userId: socket.data.userId,
        isTyping,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.data.userId} disconnected`);
      onlineUsers.delete(socket.data.userId);
      socket.broadcast.emit("userOffline", { userId: socket.data.userId });
    });
  });

  return io;
};

export const getWebSocketServer = () => {
  return io;
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
  if (!io) return;

  io.to(`conversation:${data.conversationId}`).emit("newMessage", {
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
  if (!io) return;

  io.to(`user:${data.ownerId}`).emit("billboardStatusUpdate", {
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
  if (!io) return;

  io.to(`user:${data.userId}`).emit("notification", {
    id: data.notification.id,
    type: data.notification.type,
    title: data.notification.title,
    message: data.notification.message,
    data: data.notification.data,
    createdAt: data.notification.createdAt.toISOString(),
  });
};
