#!/usr/bin/env node

const { io } = require("socket.io-client");

console.log("🚀 Testing WebSocket connection...");

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server");
  console.log("📡 Socket ID:", socket.id);

  // Test authentication
  socket.emit("authenticate", { userId: "test-user-123" });

  // Test joining a room
  socket.emit("joinRoom", { conversationId: "test-conversation" });

  console.log("🔄 Sent authentication and room join requests");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from WebSocket server");
});

socket.on("connect_error", (error) => {
  console.error("🔴 Connection error:", error.message);
});

socket.on("userOnline", (data) => {
  console.log("👤 User came online:", data.userId);
});

socket.on("userOffline", (data) => {
  console.log("👤 User went offline:", data.userId);
});

// Test for 10 seconds then disconnect
setTimeout(() => {
  console.log("⏰ Test completed, disconnecting...");
  socket.disconnect();
  process.exit(0);
}, 10000);

console.log("⏳ Testing for 10 seconds...");
