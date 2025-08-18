"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileCompletion } from "@/components/profile/profile-completion";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { type ProfileUpdateInput } from "@/lib/validations/auth";
import { useUserProfile, useUpdateProfile } from "@/hooks/use-user-profile";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // TanStack Query hooks
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  // Authentication check
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const handleProfileUpdate = async (data: ProfileUpdateInput) => {
    try {
      const result = await updateProfileMutation.mutateAsync(data);
      
      setSuccessMessage("Profile updated successfully!");

      // Update the session with new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: result.user.name,
          image: result.user.avatarUrl,
        },
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Error is handled by the mutation's error state
      console.error("Profile update error:", err);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Profile" }]}>
      <div className="max-w-full">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {updateProfileMutation.error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {updateProfileMutation.error instanceof Error 
              ? updateProfileMutation.error.message 
              : "Failed to update profile"}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-8">
          {/* Profile Form - Takes up more space */}
          <div className="xl:col-span-3 lg:col-span-2">
            <ProfileForm user={user} onUpdate={handleProfileUpdate} />
          </div>

          {/* Profile Completion - Takes up remaining space */}
          <div className="xl:col-span-1 lg:col-span-1">
            <ProfileCompletion user={user} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
