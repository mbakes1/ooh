"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search billboards by location, title, or description...",
  className = "",
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange("");
    onSearch();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative flex items-center border rounded-lg transition-colors ${
          isFocused ? "border-primary ring-2 ring-primary/20" : "border-input"
        }`}
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-20 border-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            onClick={onSearch}
            size="sm"
            className="h-7 px-3"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
