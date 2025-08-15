"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { UserManagement } from "@/components/admin/user-management";
import { User } from "@prisma/client";

interface UserWithCounts extends User {
  _count?: {
    billboards: number;
    sentMessages: number;
    receivedMessages: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      redirect("/dashboard");
    }
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "POST",
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to verify user:", error);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to suspend user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleSendMessage = (userId: string) => {
    // Navigate to messages with user pre-selected
    window.location.href = `/messages?user=${userId}`;
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Users" },
        ]}
        title="User Management"
        description="Manage platform users, roles, and permissions"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      title="User Management"
      description="Manage platform users, roles, and permissions"
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
