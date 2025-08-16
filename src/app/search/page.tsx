"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { BillboardWithDetails, TrafficLevel } from "@/types";
import { BillboardGrid } from "@/components/billboard/billboard-grid";
import { FiltersPanel } from "@/components/billboard/filters-panel";
import { Pagination } from "@/components/billboard/pagination";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

interface SearchResponse {
  billboards: BillboardWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  filters: {
    resultsCount: number;
  };
}

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
  const router = useRouter();
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

  // Results state
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update URL with current search parameters
  const updateURL = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const url = new URL(window.location.href);
      url.search = "";

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          url.searchParams.set(key, value.toString());
        }
      });

      router.push(url.pathname + url.search, { scroll: false });
    },
    [router]
  );

  // Perform search
  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      if (searchQuery) searchParams.set("query", searchQuery);
      if (filters.city) searchParams.set("city", filters.city);
      if (filters.province) searchParams.set("province", filters.province);
      if (filters.minPrice)
        searchParams.set("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        searchParams.set("maxPrice", filters.maxPrice.toString());
      if (filters.trafficLevel)
        searchParams.set("trafficLevel", filters.trafficLevel);

      searchParams.set("sortBy", sortBy);
      searchParams.set("page", currentPage.toString());
      searchParams.set("limit", "12");

      const response = await fetch(
        `/api/billboards/search?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to search billboards");
      }

      const data: SearchResponse = await response.json();
      setResults(data);

      updateURL({
        q: searchQuery,
        ...filters,
        sortBy,
        page: currentPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sortBy, currentPage, updateURL]);

  // Initial search on mount
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch();
  };

  const handleFiltersApply = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    performSearch();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    performSearch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch();
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
          {loading ? (
            <BillboardGrid loading={true} viewMode={viewMode} />
          ) : error ? (
            <div className="text-center py-16">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-medium mb-2">
                    Something went wrong
                  </h3>
                  <p>{error}</p>
                </div>
                <Button onClick={performSearch} variant="outline">
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
