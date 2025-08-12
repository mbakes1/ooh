"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Star, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchFilters } from "./search-filters";
import { formatSASTDate } from "@/lib/utils";

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: Date;
  resultsCount: number;
  saved: boolean;
}

interface SearchHistoryProps {
  onSearchSelect: (item: SearchHistoryItem) => void;
  className?: string;
}

export function SearchHistory({
  onSearchSelect,
  className = "",
}: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("billboard-search-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as SearchHistoryItem[];
        setHistory(
          parsed.map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      } catch (error) {
        console.error("Error loading search history:", error);
      }
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("billboard-search-history", JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback(
    (query: string, filters: SearchFilters, resultsCount: number) => {
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query,
        filters,
        timestamp: new Date(),
        resultsCount,
        saved: false,
      };

      setHistory((prev) => {
        // Remove duplicate searches (same query and filters)
        const filtered = prev.filter(
          (item) =>
            !(
              item.query === query &&
              JSON.stringify(item.filters) === JSON.stringify(filters)
            )
        );

        // Add new item at the beginning and limit to 50 items
        return [newItem, ...filtered].slice(0, 50);
      });
    },
    []
  );

  const toggleSaved = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, saved: !item.saved } : item
      )
    );
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    if (showSavedOnly) {
      setHistory((prev) => prev.filter((item) => item.saved));
    } else {
      setHistory([]);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours =
      (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 168) {
      // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      return formatSASTDate(timestamp);
    }
  };

  const getFilterSummary = (filters: SearchFilters) => {
    const activeFilters = [];

    if (filters.city) activeFilters.push(`City: ${filters.city}`);
    if (filters.province) activeFilters.push(`Province: ${filters.province}`);
    if (filters.minPrice || filters.maxPrice) {
      const priceRange = `R${filters.minPrice || 0} - R${filters.maxPrice || "∞"}`;
      activeFilters.push(`Price: ${priceRange}`);
    }
    if (filters.trafficLevel)
      activeFilters.push(`Traffic: ${filters.trafficLevel}`);

    return activeFilters;
  };

  const displayedHistory = showSavedOnly
    ? history.filter((item) => item.saved)
    : history;

  // Expose the addToHistory function for external use
  useEffect(() => {
    (
      window as unknown as { addToSearchHistory?: typeof addToHistory }
    ).addToSearchHistory = addToHistory;
    return () => {
      delete (window as unknown as { addToSearchHistory?: typeof addToHistory })
        .addToSearchHistory;
    };
  }, [addToHistory]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {showSavedOnly ? (
              <>
                <Star className="h-4 w-4" />
                Saved Searches
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Search History
              </>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={showSavedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSavedOnly(!showSavedOnly)}
            >
              <Star className="h-3 w-3 mr-1" />
              Saved
            </Button>
            {displayedHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearHistory}>
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayedHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {showSavedOnly
                ? "No saved searches yet. Star a search to save it for later."
                : "No search history yet. Your recent searches will appear here."}
            </p>
          </div>
        ) : (
          displayedHistory.map((item) => {
            const filterSummary = getFilterSummary(item.filters);

            return (
              <div
                key={item.id}
                className="group p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSearchSelect(item)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {item.query || "All billboards"}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.resultsCount} result
                        {item.resultsCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {filterSummary.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {filterSummary.slice(0, 3).map((filter, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {filter}
                          </Badge>
                        ))}
                        {filterSummary.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{filterSummary.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(item.timestamp)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(item.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Star
                        className={`h-3 w-3 ${item.saved ? "fill-yellow-400 text-yellow-400" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.id);
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
