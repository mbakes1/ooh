"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Search, MessageCircle, Calendar, User, Building } from "lucide-react";
import { debounce } from "lodash";

interface SearchResult {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  conversation: {
    id: string;
    billboard: {
      id: string;
      title: string;
    } | null;
  };
}

interface MessageSearchProps {
  onSelectMessage?: (conversationId: string, messageId: string) => void;
  className?: string;
}

export function MessageSearch({
  onSelectMessage,
  className,
}: MessageSearchProps) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMessages = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/messages?query=${encodeURIComponent(searchQuery)}`
        );

        if (!response.ok) {
          throw new Error("Failed to search messages");
        }

        const data = await response.json();
        setResults(data.messages || []);
        setHasSearched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [] // debounce function is stable
  );

  useEffect(() => {
    searchMessages(query);
  }, [query, searchMessages]);

  const handleResultClick = (result: SearchResult) => {
    if (onSelectMessage) {
      onSelectMessage(result.conversation.id, result.id);
    }
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(
      `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => searchMessages(query)}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {hasSearched && !loading && !error && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No messages found</h3>
            <p className="text-muted-foreground">
              Try different keywords or check your spelling
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Found {results.length} message{results.length !== 1 ? "s" : ""}
            </h3>
          </div>

          {results.map((result) => (
            <Card
              key={result.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleResultClick(result)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <img
                      src={result.sender.avatarUrl || "/default-avatar.png"}
                      alt={result.sender.name}
                      className="rounded-full"
                    />
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {result.sender.name}
                        </span>
                      </div>

                      {result.conversation.billboard && (
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {result.conversation.billboard.title}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-foreground mb-2 line-clamp-3">
                      {highlightText(result.content, query)}
                    </p>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(result.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {result.sender.id === session?.user?.id && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search Tips */}
      {!hasSearched && !query && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Search Tips</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Search for specific words or phrases</li>
              <li>• Use keywords related to billboard titles or locations</li>
              <li>• Search is case-insensitive</li>
              <li>• Results include messages from all your conversations</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
