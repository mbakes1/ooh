"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
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
  placeholder = "Type your message...",
  maxLength = 2000,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!content.trim() || disabled) return;

    onSend(content);
    setContent("");
    setIsExpanded(false);

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

      // Expand composer if content is long
      setIsExpanded(textarea.scrollHeight > 60);
    }
  };

  const remainingChars = maxLength - content.length;
  const isNearLimit = remainingChars < 100;

  return (
    <div className="space-y-2">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-[120px] resize-none pr-12"
            style={{ height: "auto" }}
          />

          {/* Character count */}
          {isNearLimit && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {remainingChars}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1">
          {isExpanded && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={disabled}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach file (coming soon)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isExpanded && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={disabled}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add emoji (coming soon)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button
            onClick={handleSend}
            disabled={disabled || !content.trim()}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Formatting tips */}
      {isExpanded && (
        <div className="text-xs text-muted-foreground">
          <p>
            Press{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to
            send,
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">
              Shift + Enter
            </kbd>{" "}
            for new line
          </p>
        </div>
      )}
    </div>
  );
}
