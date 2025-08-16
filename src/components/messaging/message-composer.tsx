"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Mic, Smile, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  sending?: boolean;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = "Ask me anything...",
  maxLength = 2000,
  sending = false,
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Enhanced Input Container */}
      <div className="relative">
        <div
          className={cn(
            "relative rounded-xl border bg-background shadow-sm transition-all duration-200",
            "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
            disabled && "opacity-50"
          )}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full resize-none border-0 bg-transparent px-4 py-3 text-sm",
              "placeholder:text-muted-foreground focus:outline-none",
              "min-h-[52px] max-h-[200px] pr-16"
            )}
            style={{ height: "auto" }}
          />

          {/* Character Count */}
          {content.length > maxLength * 0.8 && (
            <div className="absolute top-2 right-2 text-xs text-muted-foreground">
              {content.length}/{maxLength}
            </div>
          )}

          {/* Enhanced Toolbar */}
          <div className="flex items-center justify-between p-2 border-t bg-muted/30">
            {/* Left Actions */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add emoji</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {isGenerating && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopGenerating}
                  className="h-8 gap-2 text-xs"
                >
                  <X className="h-3 w-3" />
                  Stop
                </Button>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Voice message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSend}
                      disabled={disabled || !content.trim()}
                      size="sm"
                      className="h-8 w-8 p-0 shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message (Enter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Typing Indicator */}
        {sending && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
              <div
                className="w-1 h-1 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1 h-1 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span>Sending...</span>
          </div>
        )}
      </div>
    </div>
  );
}
