import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileUpdateInput } from "@/lib/validations/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADVERTISER";
  businessName?: string | null;
  contactNumber?: string | null;
  location?: string | null;
  verified: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

const USER_PROFILE_KEY = ["user", "profile"] as const;

export function useUserProfile() {
  return useQuery({
    queryKey: USER_PROFILE_KEY,
    queryFn: async (): Promise<User> => {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      return data.user;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdateInput) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(USER_PROFILE_KEY, data.user);
    },
  });
}