"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Mic, Plus, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = "Ask me anything...",
  maxLength = 2000,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!content.trim() || disabled) return;

    onSend(content);
    setContent("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setContent(value);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleStopGenerating = () => {
    setIsGenerating(false);
  };

  const handleNewChat = () => {
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="inline-flex justify-center items-center gap-x-2 rounded-lg font-medium text-gray-800 hover:text-blue-600 focus:outline-none focus:text-blue-600 text-xs sm:text-sm transition-colors"
        >
          <Plus className="shrink-0 size-4" />
          New chat
        </button>

        {isGenerating && (
          <button
            type="button"
            onClick={handleStopGenerating}
            className="py-1.5 px-2 inline-flex items-center gap-x-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            <X className="size-3" />
            Stop generating
          </button>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="p-3 sm:p-4 pb-12 sm:pb-12 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none resize-none min-h-[60px] max-h-[200px] transition-all duration-200"
          style={{ height: "auto" }}
        />

        {/* Toolbar */}
        <div className="absolute bottom-px inset-x-px p-2 rounded-b-lg bg-white">
          <div className="flex flex-wrap justify-between items-center gap-2">
            {/* Left Button Group */}
            <div className="flex items-center">
              {/* Attach Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={disabled}
                      className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-gray-100 focus:z-10 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      <Paperclip className="shrink-0 size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Right Button Group */}
            <div className="flex items-center gap-x-1">
              {/* Mic Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={disabled}
                      className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:bg-gray-100 focus:z-10 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      <Mic className="shrink-0 size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Voice message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Send Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={disabled || !content.trim()}
                      className="inline-flex shrink-0 justify-center items-center size-8 rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:z-10 focus:outline-none focus:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      <Send className="shrink-0 size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
