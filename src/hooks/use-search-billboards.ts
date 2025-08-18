import { useQuery } from "@tanstack/react-query";
import { BillboardWithDetails, TrafficLevel } from "@/types";

export interface SearchResponse {
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

interface SearchParams {
  query?: string;
  filters: SearchFilters;
  sortBy: string;
  page: number;
  limit: number;
}

export function useSearchBillboards({
  query,
  filters,
  sortBy,
  page,
  limit,
}: SearchParams) {
  return useQuery<SearchResponse>({
    queryKey: ["billboards", "search", { query, filters, sortBy, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (query) searchParams.set("query", query);
      if (filters.city) searchParams.set("city", filters.city);
      if (filters.province) searchParams.set("province", filters.province);
      if (filters.minPrice)
        searchParams.set("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        searchParams.set("maxPrice", filters.maxPrice.toString());
      if (filters.trafficLevel)
        searchParams.set("trafficLevel", filters.trafficLevel);

      searchParams.set("sortBy", sortBy);
      searchParams.set("page", page.toString());
      searchParams.set("limit", limit.toString());

      const response = await fetch(
        `/api/billboards/search?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to search billboards");
      }

      return response.json();
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}