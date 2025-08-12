"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserManagement } from "./user-management";
import { BillboardModeration } from "./billboard-moderation";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { User, Billboard } from "@/types";
import { toast } from "sonner";

export function AdminDashboard() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [billboards, setBillboards] = React.useState<Billboard[]>([]);
  const [analyticsData, setAnalyticsData] = React.useState<{
    totalUsers: number;
    totalBillboards: number;
    totalMessages: number;
    totalRevenue: number;
    newUsersThisMonth: number;
    newBillboardsThisMonth: number;
    messagesThisMonth: number;
    revenueThisMonth: number;
    userGrowthRate: number;
    billboardGrowthRate: number;
    messageGrowthRate: number;
    revenueGrowthRate: number;
    topProvinces: Array<{ name: string; count: number; percentage: number }>;
    topCities: Array<{ name: string; count: number; percentage: number }>;
    monthlyStats: Array<{
      month: string;
      users: number;
      billboards: number;
      messages: number;
      revenue: number;
    }>;
  } | null>(null);
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
        setUsers(usersData);
      }

      // Fetch billboards
      const billboardsResponse = await fetch("/api/admin/billboards");
      if (billboardsResponse.ok) {
        const billboardsData = await billboardsResponse.json();
        setBillboards(billboardsData);
      }

      // Fetch analytics
      const analyticsResponse = await fetch("/api/admin/analytics");
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        setAnalyticsData(analytics);
      }
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

  const handleSendMessage = async () => {
    // This would open a message composer modal
    toast.info("Message composer would open here");
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

  // Analytics handlers
  const handleExportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/export/${type}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`${type} report exported successfully`);
      } else {
        toast.error("Failed to export report");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, moderate content, and view platform analytics.
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="billboards">Billboard Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          {analyticsData ? (
            <AnalyticsDashboard
              data={analyticsData}
              onExportReport={handleExportReport}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Loading analytics data...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
