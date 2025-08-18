import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Billboard } from "@prisma/client";

const ADMIN_BILLBOARDS_KEY = ["admin", "billboards"] as const;

export function useAdminBillboards() {
  return useQuery({
    queryKey: ADMIN_BILLBOARDS_KEY,
    queryFn: async (): Promise<Billboard[]> => {
      const response = await fetch("/api/admin/billboards");
      if (!response.ok) {
        throw new Error("Failed to fetch billboards");
      }
      const data = await response.json();
      return data.billboards || [];
    },
  });
}

export function useApproveBillboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billboardId: string) => {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/approve`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to approve billboard");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BILLBOARDS_KEY });
    },
  });
}

export function useRejectBillboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      billboardId,
      reason,
    }: {
      billboardId: string;
      reason: string;
    }) => {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to reject billboard");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BILLBOARDS_KEY });
    },
  });
}

export function useSuspendBillboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billboardId: string) => {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/suspend`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to suspend billboard");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BILLBOARDS_KEY });
    },
  });
}
