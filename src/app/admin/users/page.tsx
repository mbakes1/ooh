"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { UserManagement } from "@/components/admin/user-management";
import {
  useAdminUsers,
  useVerifyUser,
  useSuspendUser,
  useDeleteUser,
} from "@/hooks/use-admin-users";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();

  // TanStack Query hooks
  const { data: users = [], isLoading, error } = useAdminUsers();
  const verifyMutation = useVerifyUser();
  const suspendMutation = useSuspendUser();
  const deleteMutation = useDeleteUser();

  // Authentication checks
  if (status === "unauthenticated") {
    redirect("/auth/login");
  }
  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const handleVerifyUser = (userId: string) => {
    verifyMutation.mutate(userId);
  };

  const handleSuspendUser = (userId: string) => {
    suspendMutation.mutate(userId);
  };

  const handleDeleteUser = (userId: string) => {
    deleteMutation.mutate(userId);
  };

  const handleSendMessage = (userId: string) => {
    // Navigate to messages with user pre-selected
    window.location.href = `/messages?user=${userId}`;
  };

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Users" },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Users" },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load users</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Users" },
      ]}
    >
      <UserManagement
        users={users}
        onVerifyUser={handleVerifyUser}
        onSuspendUser={handleSuspendUser}
        onDeleteUser={handleDeleteUser}
        onSendMessage={handleSendMessage}
      />
    </DashboardLayout>
  );
}
