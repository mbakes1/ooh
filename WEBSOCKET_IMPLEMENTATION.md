# WebSocket Implementation Guide

## Overview

This document outlines the implementation of true real-time functionality using WebSockets in the Digital Billboard Marketplace application. The implementation replaces the previous HTTP polling mechanism with Socket.IO for instant, bidirectional communication.

## Architecture

### Backend Components

1. **Custom Server (`server.js`)**
   - Initializes Socket.IO server alongside Next.js
   - Handles WebSocket connections and authentication
   - Manages user rooms and conversation rooms
   - Provides real-time event broadcasting

2. **WebSocket Manager (`src/lib/websocket/manager.ts`)**
   - Provides helper functions for emitting events from API routes
   - Handles message broadcasting, notifications, and status updates
   - Manages global Socket.IO instance access

3. **Type Definitions (`src/lib/websocket/server.ts`)**
   - Defines TypeScript interfaces for client-server communication
   - Specifies event types and data structures
   - Ensures type safety across the WebSocket implementation

### Frontend Components

1. **WebSocket Client (`src/lib/websocket/client.ts`)**
   - Manages Socket.IO client connection
   - Provides helper functions for common operations
   - Handles connection lifecycle and error management

2. **WebSocket Provider (`src/components/providers/websocket-provider.tsx`)**
   - React context provider for WebSocket functionality
   - Manages connection state and user authentication
   - Provides hooks for components to access WebSocket features

3. **WebSocket Status Component (`src/components/websocket-status.tsx`)**
   - Visual indicator of connection status
   - Shows online user count
   - Provides real-time connection feedback

## Key Features

### Real-Time Messaging

- Instant message delivery without page refresh
- Message read receipts
- Typing indicators
- Multi-user conversation support

### User Presence

- Online/offline status tracking
- Real-time user activity indicators
- Connection state management

### Notifications

- Instant in-app notifications
- Billboard status updates
- System-wide announcements

## Implementation Details

### Server Setup

The custom server (`server.js`) initializes Socket.IO alongside Next.js:

```javascript
// Initialize Socket.IO for real-time features
const { Server: SocketIOServer } = require("socket.io");
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NEXTAUTH_URL?.split(",") || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
```

### Authentication

Users authenticate via a simple user ID mechanism:

- Client sends user ID after connection
- Server validates user exists in database
- User joins personal room for notifications

### Room Management

The system uses two types of rooms:

1. **User Rooms**: `user:{userId}` - For personal notifications
2. **Conversation Rooms**: `conversation:{conversationId}` - For chat messages

### Event Types

#### Client to Server Events

- `authenticate`: User authentication with user ID
- `joinRoom`: Join a conversation room
- `leaveRoom`: Leave a conversation room
- `typing`: Send typing indicator

#### Server to Client Events

- `newMessage`: New message in conversation
- `messageRead`: Message read receipt
- `userOnline`/`userOffline`: User presence updates
- `notification`: System notifications
- `billboardStatusUpdate`: Billboard status changes

## Usage Examples

### Sending Real-Time Messages

In API routes, use the WebSocket manager to broadcast events:

```typescript
import { emitNewMessage } from "@/lib/websocket/manager";

// After creating a message in the database
emitNewMessage({
  conversationId: validatedData.conversationId,
  message: {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderAvatar: message.sender.avatarUrl,
    createdAt: message.createdAt,
  },
});
```

### Listening for Messages

In React components, use the WebSocket context:

```typescript
import { useWebSocket } from "@/components/providers/websocket-provider";

const { socket, isConnected } = useWebSocket();

useEffect(() => {
  if (socket) {
    socket.on("newMessage", (data) => {
      // Handle new message
      console.log("New message:", data);
    });

    return () => {
      socket.off("newMessage");
    };
  }
}, [socket]);
```

## Running the Application

### Development

Use the custom server for development to enable WebSocket functionality:

```bash
npm run dev:custom
```

This runs `node server.js` which includes both Next.js and Socket.IO.

### Production

For production deployment, ensure the custom server is used instead of the default Next.js server.

## Testing

### WebSocket Test Page

Visit `/test-websocket` to access a comprehensive test interface that allows you to:

- Check connection status
- Send test messages
- Monitor real-time events
- Test typing indicators
- View online users

### Manual Testing

1. Open multiple browser tabs/windows
2. Log in with different users
3. Start conversations
4. Verify real-time message delivery
5. Test connection recovery after network issues

## Performance Considerations

### Connection Management

- Automatic reconnection on network issues
- Graceful degradation to HTTP polling if WebSockets fail
- Connection pooling and resource cleanup

### Scalability

- Room-based message broadcasting reduces unnecessary traffic
- Event-driven architecture minimizes server load
- Efficient user presence tracking

### Error Handling

- Comprehensive error logging
- Fallback mechanisms for failed connections
- User-friendly error messages

## Security

### Authentication

- User validation on connection
- Database verification of user existence
- Session-based user identification

### Authorization

- Room access control based on conversation participation
- User-specific notification delivery
- Secure event broadcasting

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify server is running with `npm run dev:custom`
   - Check CORS configuration
   - Ensure user is authenticated

2. **Messages Not Received**
   - Verify user has joined the conversation room
   - Check WebSocket connection status
   - Review server logs for errors

3. **Performance Issues**
   - Monitor connection count
   - Check for memory leaks in event listeners
   - Verify proper cleanup on component unmount

### Debug Tools

- WebSocket status indicator in sidebar
- Browser developer tools Network tab
- Server console logs
- Test page at `/test-websocket`

## Future Enhancements

### Planned Features

- Message encryption for sensitive conversations
- File sharing through WebSocket connections
- Voice/video call integration
- Advanced presence indicators (typing, online, away)
- Message history synchronization
- Push notifications for mobile devices

### Performance Optimizations

- Redis adapter for multi-server deployments
- Message queuing for offline users
- Connection clustering and load balancing
- Advanced caching strategies

## Conclusion

The WebSocket implementation provides a robust foundation for real-time features in the Digital Billboard Marketplace. It replaces inefficient HTTP polling with instant, bidirectional communication, significantly improving user experience and reducing server load.

The modular architecture allows for easy extension and maintenance, while comprehensive error handling ensures reliable operation in production environments.
