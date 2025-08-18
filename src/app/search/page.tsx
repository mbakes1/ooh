"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, MapPin, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TrafficLevel } from "@/types";
import { BillboardGrid } from "@/components/billboard/billboard-grid";
import { FiltersPanel } from "@/components/billboard/filters-panel";
import { Pagination } from "@/components/billboard/pagination";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useSearchBillboards } from "@/hooks/use-search-billboards";

interface SearchFilters {
  city?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  trafficLevel?: TrafficLevel;
}

function SearchPageContent() {
  const searchParams = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<SearchFilters>({
    city: searchParams.get("city") || undefined,
    province: searchParams.get("province") || undefined,
    minPrice: searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined,
    trafficLevel:
      (searchParams.get("trafficLevel") as TrafficLevel) || undefined,
  });
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "relevance"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  // TanStack Query hook
  const { data: results, isLoading, error, refetch } = useSearchBillboards({
    query: searchQuery,
    filters,
    sortBy,
    page: currentPage,
    limit: 12,
  });

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleFiltersApply = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    refetch();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch();
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: "Explore Billboards" }]}>
      <div className="space-y-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location, title, or description..."
              className="pl-10 h-12 border-border/60 focus:border-primary/60"
            />
          </div>
          <Button type="submit" size="lg" className="px-8">
            Search
          </Button>
        </form>

        {/* Controls Bar */}
        <div className="flex items-center justify-between py-4 border-b border-border/20">
          <div className="flex items-center gap-4">
            {/* Filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {Object.values(filters).some((v) => v !== undefined) && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 p-0 text-xs"
                    >
                      {
                        Object.values(filters).filter((v) => v !== undefined)
                          .length
                      }
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter Results</SheetTitle>
                </SheetHeader>
                <FiltersPanel filters={filters} onApply={handleFiltersApply} />
              </SheetContent>
            </Sheet>

            {/* Results Count */}
            {results && (
              <span className="text-sm text-muted-foreground">
                {results.pagination.total} billboard
                {results.pagination.total !== 1 ? "s" : ""} found
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="date-desc">Recently Listed</SelectItem>
                <SelectItem value="location-asc">Location A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-8">
          {isLoading ? (
            <BillboardGrid loading={true} viewMode={viewMode} />
          ) : error ? (
            <div className="text-center py-16">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-2">
                    Something went wrong
                  </h3>
                  <p>Failed to search billboards</p>
                </div>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : results?.billboards.length === 0 ? (
            <div className="text-center py-16">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-2">
                    No billboards found
                  </h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <BillboardGrid
                billboards={results?.billboards || []}
                viewMode={viewMode}
              />

              {results && results.pagination.totalPages > 1 && (
                <Pagination
                  currentPage={results.pagination.page}
                  totalPages={results.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}
    >
      <SearchPageContent />
    </Suspense>
  );
}
