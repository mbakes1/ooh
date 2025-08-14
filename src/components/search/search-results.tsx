"use client";

import React from "react";
import { ArrowUpDown, Grid, List, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { BillboardWithDetails } from "@/types";
import { BillboardCard } from "@/components/billboard/billboard-card";

interface SearchResultsProps {
  billboards: BillboardWithDetails[];
  total: number;
  loading?: boolean;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function SearchResults({
  billboards,
  total,
  loading = false,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SearchResultsProps) {
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    onSortChange(newSortBy, newSortOrder);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Results Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        {/* Results Skeleton */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {[...Array(6)].map((_, i) => (
            <BillboardCard key={i} loading={true} viewMode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total} billboard{total !== 1 ? "s" : ""} found
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Options */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="location-asc">Location A-Z</SelectItem>
              <SelectItem value="location-desc">Location Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      {billboards.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No billboards found</h3>
              <p>
                Try adjusting your search criteria or filters to find more
                results.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {billboards.map((billboard) => (
            <BillboardCard
              key={billboard.id}
              billboard={billboard}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
