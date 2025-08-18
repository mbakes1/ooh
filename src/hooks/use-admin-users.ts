import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@prisma/client";
import { useAdminNotifications } from "@/hooks/use-notifications";

interface UserWithCounts extends User {
  _count?: {
    billboards: number;
    sentMessages: number;
    receivedMessages: number;
  };
}

const ADMIN_USERS_KEY = ["admin", "users"] as const;

export function useAdminUsers() {
  return useQuery({
    queryKey: ADMIN_USERS_KEY,
    queryFn: async (): Promise<UserWithCounts[]> => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      return data.users || [];
    },
  });
}

export function useVerifyUser() {
  const queryClient = useQueryClient();
  const adminNotifications = useAdminNotifications();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to verify user");
      }
      return response.json();
    },
    onSuccess: (data, userId) => {
      // Find the user in the cache to get their name
      const users = queryClient.getQueryData<UserWithCounts[]>(ADMIN_USERS_KEY);
      const user = users?.find((u) => u.id === userId);
      adminNotifications.userPromoted(user?.name || "User");
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  const adminNotifications = useAdminNotifications();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to suspend user");
      }
      return response.json();
    },
    onSuccess: (data, userId) => {
      // Find the user in the cache to get their name
      const users = queryClient.getQueryData<UserWithCounts[]>(ADMIN_USERS_KEY);
      const user = users?.find((u) => u.id === userId);
      adminNotifications.userBanned(user?.name || "User");
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const adminNotifications = useAdminNotifications();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      return response.json();
    },
    onSuccess: () => {
      adminNotifications.contentModerated();
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}