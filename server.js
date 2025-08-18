const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO for real-time features
  const { Server: SocketIOServer } = require("socket.io");
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL?.split(",") || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Store online users
  const onlineUsers = new Map();

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Handle user authentication and room joining
    socket.on("authenticate", async (data) => {
      if (data.userId) {
        socket.userId = data.userId;
        onlineUsers.set(data.userId, socket.id);
        socket.join(`user:${data.userId}`);
        socket.broadcast.emit("userOnline", { userId: data.userId });
        console.log(
          `User ${data.userId} authenticated and joined personal room`
        );
      }
    });

    // Handle joining conversation rooms
    socket.on("joinRoom", ({ conversationId }) => {
      if (socket.userId) {
        socket.join(`conversation:${conversationId}`);
        console.log(
          `User ${socket.userId} joined conversation ${conversationId}`
        );
      }
    });

    // Handle leaving conversation rooms
    socket.on("leaveRoom", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle typing indicators
    socket.on("typing", ({ conversationId, isTyping }) => {
      if (socket.userId) {
        console.log(
          `User ${socket.userId} is ${isTyping ? "typing" : "stopped typing"} in ${conversationId}`
        );
        socket.to(`conversation:${conversationId}`).emit("typing", {
          userId: socket.userId,
          isTyping,
        });
      }
    });

    // Handle test messages (for testing purposes)
    socket.on("newMessage", (data) => {
      if (socket.userId) {
        console.log(
          `Broadcasting test message from ${socket.userId}:`,
          data.content
        );
        socket
          .to(`conversation:${data.conversationId}`)
          .emit("newMessage", data);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected`);
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit("userOffline", { userId: socket.userId });
      } else {
        console.log("Client disconnected:", socket.id);
      }
    });
  });

  // Make io available globally for API routes
  global.io = io;

  console.log("Starting server with real-time WebSocket features...");

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log("✅ Real-time WebSocket server initialized");
      console.log(`📡 Socket.IO server running on port ${port}`);
    });
});
