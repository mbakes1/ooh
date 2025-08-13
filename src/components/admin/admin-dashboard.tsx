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
import { AdvancedAnalytics } from "./advanced-analytics";
import { AdminReports } from "./admin-reports";
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

  const handleBulkVerifyUsers = async (userIds: string[]) => {
    try {
      const promises = userIds.map((userId) =>
        fetch(`/api/admin/users/${userId}/verify`, { method: "POST" })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === userIds.length) {
        toast.success(`${successCount} users verified successfully`);
      } else {
        toast.warning(`${successCount} of ${userIds.length} users verified`);
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error bulk verifying users:", error);
      toast.error("Failed to verify users");
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

  const handleBulkSuspendUsers = async (userIds: string[]) => {
    if (!confirm(`Are you sure you want to suspend ${userIds.length} users?`)) {
      return;
    }

    try {
      const promises = userIds.map((userId) =>
        fetch(`/api/admin/users/${userId}/suspend`, { method: "POST" })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === userIds.length) {
        toast.success(`${successCount} users suspended successfully`);
      } else {
        toast.warning(`${successCount} of ${userIds.length} users suspended`);
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error bulk suspending users:", error);
      toast.error("Failed to suspend users");
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

  const handleBulkDeleteUsers = async (userIds: string[]) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userIds.length} users? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const promises = userIds.map((userId) =>
        fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === userIds.length) {
        toast.success(`${successCount} users deleted successfully`);
      } else {
        toast.warning(`${successCount} of ${userIds.length} users deleted`);
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      toast.error("Failed to delete users");
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

  const handleBulkApproveBillboards = async (billboardIds: string[]) => {
    try {
      const promises = billboardIds.map((billboardId) =>
        fetch(`/api/admin/billboards/${billboardId}/approve`, {
          method: "POST",
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === billboardIds.length) {
        toast.success(`${successCount} billboards approved successfully`);
      } else {
        toast.warning(
          `${successCount} of ${billboardIds.length} billboards approved`
        );
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error bulk approving billboards:", error);
      toast.error("Failed to approve billboards");
    }
  };

  const handleBulkRejectBillboards = async (
    billboardIds: string[],
    reason: string
  ) => {
    try {
      const promises = billboardIds.map((billboardId) =>
        fetch(`/api/admin/billboards/${billboardId}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === billboardIds.length) {
        toast.success(`${successCount} billboards rejected successfully`);
      } else {
        toast.warning(
          `${successCount} of ${billboardIds.length} billboards rejected`
        );
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error bulk rejecting billboards:", error);
      toast.error("Failed to reject billboards");
    }
  };

  const handleBulkSuspendBillboards = async (billboardIds: string[]) => {
    if (
      !confirm(
        `Are you sure you want to suspend ${billboardIds.length} billboards?`
      )
    ) {
      return;
    }

    try {
      const promises = billboardIds.map((billboardId) =>
        fetch(`/api/admin/billboards/${billboardId}/suspend`, {
          method: "POST",
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount === billboardIds.length) {
        toast.success(`${successCount} billboards suspended successfully`);
      } else {
        toast.warning(
          `${successCount} of ${billboardIds.length} billboards suspended`
        );
      }

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error bulk suspending billboards:", error);
      toast.error("Failed to suspend billboards");
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billboards">Billboards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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

        <TabsContent value="advanced">
          {analyticsData ? (
            <AdvancedAnalytics
              data={{
                ...analyticsData,
                userEngagement: {
                  activeUsers: Math.floor(analyticsData.totalUsers * 0.15),
                  averageSessionDuration: 420, // 7 minutes in seconds
                  bounceRate: 35.2,
                  returnUserRate: 68.5,
                },
                billboardPerformance: {
                  averageViewsPerBillboard: 1250,
                  topPerformingBillboards: [
                    {
                      id: "1",
                      title: "Cape Town CBD Premium",
                      views: 5420,
                      inquiries: 89,
                    },
                    {
                      id: "2",
                      title: "Johannesburg Highway",
                      views: 4890,
                      inquiries: 76,
                    },
                    {
                      id: "3",
                      title: "Durban Beachfront",
                      views: 4320,
                      inquiries: 65,
                    },
                  ],
                  conversionRate: 6.8,
                },
                systemHealth: {
                  uptime: 99.8,
                  responseTime: 145,
                  errorRate: 0.2,
                  activeConnections: 342,
                },
              }}
              onExportReport={handleExportReport}
              onRefreshData={fetchData}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Loading advanced analytics data...
                </CardDescription>
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
            onBulkVerifyUsers={handleBulkVerifyUsers}
            onBulkSuspendUsers={handleBulkSuspendUsers}
            onBulkDeleteUsers={handleBulkDeleteUsers}
          />
        </TabsContent>

        <TabsContent value="billboards">
          <BillboardModeration
            billboards={billboards}
            onApproveBillboard={handleApproveBillboard}
            onRejectBillboard={handleRejectBillboard}
            onViewBillboard={handleViewBillboard}
            onSuspendBillboard={handleSuspendBillboard}
            onBulkApproveBillboards={handleBulkApproveBillboards}
            onBulkRejectBillboards={handleBulkRejectBillboards}
            onBulkSuspendBillboards={handleBulkSuspendBillboards}
          />
        </TabsContent>

        <TabsContent value="reports">
          <AdminReports
            onGenerateReport={async (config) => {
              try {
                const queryParams = new URLSearchParams({
                  format: config.format,
                  start_date: config.dateRange.start,
                  end_date: config.dateRange.end,
                  ...config.filters,
                });

                const response = await fetch(
                  `/api/admin/export/${config.type}?${queryParams}`
                );

                if (response.ok) {
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${config.type}-report-${new Date().toISOString().split("T")[0]}.${config.format}`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } else {
                  throw new Error("Failed to generate report");
                }
              } catch (error) {
                console.error("Error generating report:", error);
                throw error;
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
