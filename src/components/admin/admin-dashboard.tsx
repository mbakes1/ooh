"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "./user-management";
import { BillboardModeration } from "./billboard-moderation";
import { User, Billboard } from "@/types";
import { toast } from "sonner";
import { Users, Building2, MessageSquare } from "lucide-react";

export function AdminDashboard() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [billboards, setBillboards] = React.useState<Billboard[]>([]);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalBillboards: 0,
    pendingBillboards: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersResponse = await fetch("/api/admin/users");
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Fetch billboards
      const billboardsResponse = await fetch("/api/admin/billboards");
      if (billboardsResponse.ok) {
        const billboardsData = await billboardsResponse.json();
        setBillboards(billboardsData.billboards || []);
      }

      // Calculate stats
      const totalUsers = users.length;
      const totalBillboards = billboards.length;
      const pendingBillboards = billboards.filter(
        (b) => b.status === "PENDING"
      ).length;
      const activeUsers = users.filter((u) => u.verified).length;

      setStats({
        totalUsers,
        totalBillboards,
        pendingBillboards,
        activeUsers,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  // User management handlers
  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("User verified successfully");
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to verify user");
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      toast.error("Failed to verify user");
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("User suspended successfully");
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to suspend user");
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      toast.error("Failed to suspend user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleSendMessage = (userId: string) => {
    // Navigate to messages with user pre-selected
    window.location.href = `/messages?user=${userId}`;
  };

  // Billboard moderation handlers
  const handleApproveBillboard = async (billboardId: string) => {
    try {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/approve`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Billboard approved successfully");
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to approve billboard");
      }
    } catch (error) {
      console.error("Error approving billboard:", error);
      toast.error("Failed to approve billboard");
    }
  };

  const handleRejectBillboard = async (billboardId: string, reason: string) => {
    try {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        toast.success("Billboard rejected successfully");
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to reject billboard");
      }
    } catch (error) {
      console.error("Error rejecting billboard:", error);
      toast.error("Failed to reject billboard");
    }
  };

  const handleViewBillboard = (billboardId: string) => {
    window.open(`/billboards/${billboardId}`, "_blank");
  };

  const handleSuspendBillboard = async (billboardId: string) => {
    try {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/suspend`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Billboard suspended successfully");
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to suspend billboard");
      }
    } catch (error) {
      console.error("Error suspending billboard:", error);
      toast.error("Failed to suspend billboard");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Billboards
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBillboards}</div>
            <p className="text-xs text-muted-foreground">
              All billboard listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBillboards}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Verified accounts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="billboards">Billboard Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement
            users={users}
            onVerifyUser={handleVerifyUser}
            onSuspendUser={handleSuspendUser}
            onDeleteUser={handleDeleteUser}
            onSendMessage={handleSendMessage}
          />
        </TabsContent>

        <TabsContent value="billboards">
          <BillboardModeration
            billboards={billboards}
            onApproveBillboard={handleApproveBillboard}
            onRejectBillboard={handleRejectBillboard}
            onViewBillboard={handleViewBillboard}
            onSuspendBillboard={handleSuspendBillboard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
