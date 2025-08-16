"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileCompletion } from "@/components/profile/profile-completion";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { type ProfileUpdateInput } from "@/lib/validations/auth";

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

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError("Failed to load profile. Please try again.");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (data: ProfileUpdateInput) => {
    try {
      setError(null);
      setSuccessMessage(null);

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

      const result = await response.json();
      setUser(result.user);
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
      setError(err instanceof Error ? err.message : "Failed to update profile");
      console.error("Profile update error:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUserProfile}
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
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
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
