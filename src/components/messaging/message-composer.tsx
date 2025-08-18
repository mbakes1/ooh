"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send, Paperclip, Smile, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMessageNotifications } from "@/hooks/use-notifications";

interface MessageComposerProps {
  onSend: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  sending?: boolean;
  showNotifications?: boolean;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 2000,
  sending = false,
  showNotifications = true,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageNotifications = useMessageNotifications();

  const handleSend = async () => {
    if ((!content.trim() && attachments.length === 0) || disabled) return;

    const messageContent = content;
    const messageAttachments = [...attachments];
    setContent("");
    setAttachments([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSend(messageContent, messageAttachments);
      if (showNotifications) {
        messageNotifications.sendSuccess();
      }
    } catch (error) {
      if (showNotifications) {
        messageNotifications.sendError(
          error instanceof Error ? error.message : "Failed to send message"
        );
      }
      // Restore content on error
      setContent(messageContent);
      setAttachments(messageAttachments);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    event.target.value = ""; // Reset input
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setAttachments((prev) => [...prev, ...imageFiles]);
    event.target.value = ""; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // Common emojis for quick access
  const commonEmojis = [
    "😀",
    "😂",
    "😍",
    "🤔",
    "👍",
    "👎",
    "❤️",
    "🎉",
    "😢",
    "😮",
    "🔥",
    "💯",
  ];

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        !(event.target as Element)?.closest(".emoji-picker-container")
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

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

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border-t bg-muted/20">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-background rounded px-2 py-1 text-sm"
                >
                  <span className="truncate max-w-32">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Toolbar */}
          <div className="flex items-center justify-between p-2 border-t bg-muted/30">
            {/* Left Actions */}
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      onClick={() => fileInputRef.current?.click()}
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

              <input
                ref={imageInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleImageSelect}
                accept="image/*"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      onClick={() => imageInputRef.current?.click()}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      <Image className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
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

                {/* Simple Emoji Picker */}
                {showEmojiPicker && (
                  <div className="emoji-picker-container absolute bottom-full left-0 mb-2 bg-background border rounded-lg shadow-lg p-2 z-50">
                    <div className="grid grid-cols-6 gap-1">
                      {commonEmojis.map((emoji, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => insertEmoji(emoji)}
                          className="h-8 w-8 p-0 hover:bg-muted text-lg"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSend}
                      disabled={
                        disabled ||
                        (!content.trim() && attachments.length === 0)
                      }
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
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:100ms]"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:200ms]"></div>
            </div>
            <span>Sending...</span>
          </div>
        )}
      </div>
    </div>
  );
}
