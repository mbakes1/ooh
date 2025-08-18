import { useQuery } from "@tanstack/react-query";

interface BillboardWithAnalytics {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  province: string;
  basePrice: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  analytics: {
    totalInquiries: number;
  };
}

interface UseOwnerBillboardsParams {
  page: number;
  limit?: number;
  status?: string;
}

export function useOwnerBillboards({
  page,
  limit = 10,
  status,
}: UseOwnerBillboardsParams) {
  return useQuery({
    queryKey: ["owner", "billboards", { page, limit, status }],
    queryFn: async (): Promise<BillboardWithAnalytics[]> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && status !== "all" && { status }),
      });

      const response = await fetch(`/api/billboards/owner?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch billboards");
      }
      const data = await response.json();
      return data.billboards || [];
    },
  });
}
