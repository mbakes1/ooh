"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Map, Grid, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import {
  SearchFiltersPanel,
  SearchFilters,
} from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { SearchPagination } from "@/components/search/search-pagination";
import { MapView } from "@/components/search/map-view";
import {
  SearchHistory,
  SearchHistoryItem,
} from "@/components/search/search-history";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { BillboardWithDetails, TrafficLevel } from "@/types";

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
    minWidth: searchParams.get("minWidth")
      ? parseInt(searchParams.get("minWidth")!)
      : undefined,
    maxWidth: searchParams.get("maxWidth")
      ? parseInt(searchParams.get("maxWidth")!)
      : undefined,
    minHeight: searchParams.get("minHeight")
      ? parseInt(searchParams.get("minHeight")!)
      : undefined,
    maxHeight: searchParams.get("maxHeight")
      ? parseInt(searchParams.get("maxHeight")!)
      : undefined,
    trafficLevel:
      (searchParams.get("trafficLevel") as TrafficLevel) || undefined,
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "date");
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(searchParams.get("limit") || "12")
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [displayMode, setDisplayMode] = useState<"results" | "map" | "history">(
    "results"
  );
  const [selectedBillboard, setSelectedBillboard] =
    useState<BillboardWithDetails | null>(null);
  // const [showHistory, setShowHistory] = useState(false);

  // Results state
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update URL with current search parameters
  const updateURL = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const url = new URL(window.location.href);

      // Clear existing search params
      url.search = "";

      // Add new params
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
      if (filters.minWidth)
        searchParams.set("minWidth", filters.minWidth.toString());
      if (filters.maxWidth)
        searchParams.set("maxWidth", filters.maxWidth.toString());
      if (filters.minHeight)
        searchParams.set("minHeight", filters.minHeight.toString());
      if (filters.maxHeight)
        searchParams.set("maxHeight", filters.maxHeight.toString());
      if (filters.trafficLevel)
        searchParams.set("trafficLevel", filters.trafficLevel);

      searchParams.set("sortBy", sortBy);
      searchParams.set("sortOrder", sortOrder);
      searchParams.set("page", currentPage.toString());
      searchParams.set("limit", itemsPerPage.toString());

      const response = await fetch(
        `/api/billboards/search?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to search billboards");
      }

      const data: SearchResponse = await response.json();
      setResults(data);

      // Update URL
      updateURL({
        q: searchQuery,
        ...filters,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    updateURL,
  ]);

  // Initial search on mount
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Handlers
  const handleSearch = () => {
    setCurrentPage(1);
    performSearch();
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleFiltersApply = () => {
    setCurrentPage(1);
    performSearch();
  };

  const handleFiltersClear = () => {
    setFilters({});
    setCurrentPage(1);
    performSearch();
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    performSearch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch();
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    performSearch();
  };

  const handleHistorySelect = (item: SearchHistoryItem) => {
    setSearchQuery(item.query);
    setFilters(item.filters);
    setCurrentPage(1);
    setDisplayMode("results");
    performSearch();
  };

  const handleBillboardSelect = (billboard: BillboardWithDetails) => {
    setSelectedBillboard(billboard);
  };

  // Add search to history after successful search
  useEffect(() => {
    if (results && typeof window !== "undefined") {
      const addToHistory = (
        window as unknown as {
          addToSearchHistory?: (
            query: string,
            filters: SearchFilters,
            resultsCount: number
          ) => void;
        }
      ).addToSearchHistory;
      if (addToHistory) {
        addToHistory(searchQuery, filters, results.pagination.total);
      }
    }
  }, [results, searchQuery, filters]);

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Find Billboards" }]}
      title="Search Billboards"
      description="Find the perfect digital billboard for your advertising campaign"
    >
      <div className="space-y-6">
        {/* Search Bar and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            className="flex-1 max-w-2xl"
          />

          <div className="flex items-center gap-2">
            <Button
              variant={displayMode === "results" ? "default" : "outline"}
              size="sm"
              onClick={() => setDisplayMode("results")}
            >
              <Grid className="h-4 w-4 mr-2" />
              Results
            </Button>
            <Button
              variant={displayMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setDisplayMode("map")}
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </Button>
            <Button
              variant={displayMode === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setDisplayMode("history")}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Hide on history view */}
          {displayMode !== "history" && (
            <div className="lg:col-span-1">
              <SearchFiltersPanel
                filters={filters}
                onChange={handleFiltersChange}
                onApply={handleFiltersApply}
                onClear={handleFiltersClear}
              />
            </div>
          )}

          {/* Main Content */}
          <div
            className={`space-y-6 ${displayMode === "history" ? "lg:col-span-4" : "lg:col-span-3"}`}
          >
            {displayMode === "history" ? (
              <SearchHistory onSearchSelect={handleHistorySelect} />
            ) : displayMode === "map" ? (
              <div className="space-y-4">
                {error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">Error: {error}</p>
                    <Button onClick={performSearch}>Try Again</Button>
                  </div>
                ) : (
                  <MapView
                    billboards={results?.billboards || []}
                    onBillboardSelect={handleBillboardSelect}
                    selectedBillboard={selectedBillboard}
                  />
                )}
              </div>
            ) : (
              // Results view
              <>
                {error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">Error: {error}</p>
                    <Button onClick={performSearch}>Try Again</Button>
                  </div>
                ) : (
                  <>
                    <SearchResults
                      billboards={results?.billboards || []}
                      total={results?.pagination.total || 0}
                      loading={loading}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSortChange={handleSortChange}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                    />

                    {results && results.pagination.totalPages > 1 && (
                      <SearchPagination
                        currentPage={results.pagination.page}
                        totalPages={results.pagination.totalPages}
                        totalItems={results.pagination.total}
                        itemsPerPage={results.pagination.limit}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
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
