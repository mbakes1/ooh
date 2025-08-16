"use client";

import { useState } from "react";
import { MessageComposer } from "@/components/messaging/message-composer";

export default function TestChatPage() {
  const [messages, setMessages] = useState<
    Array<{ id: string; content: string; timestamp: Date }>
  >([]);

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  AI
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Chat Assistant
                </h3>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  No messages yet
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-end space-x-3 justify-end"
                >
                  <div className="max-w-[75%]">
                    <div className="relative px-4 py-3 rounded-2xl shadow-sm bg-blue-600 text-white rounded-br-md">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <div className="flex items-center mt-1 space-x-2 justify-end">
                      <p className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Composer */}
          <div className="border-t bg-white/80 backdrop-blur-sm p-6">
            <MessageComposer
              onSend={handleSendMessage}
              placeholder="Type your message..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
