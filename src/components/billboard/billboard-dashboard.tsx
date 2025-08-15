"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BillboardManagementTable } from "./billboard-management-table";
import { BillboardStats } from "./billboard-stats";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  RefreshCw,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  BarChart3,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

interface BillboardWithAnalytics {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  province: string;
  basePrice: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  analytics: {
    totalInquiries: number;
    totalViews?: number;
    conversionRate?: number;
  };
}

interface DashboardData {
  billboards: BillboardWithAnalytics[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

interface DashboardAnalytics {
  totalViews: number;
  totalInquiries: number;
  totalRevenue: number;
  conversionRate: number;
  monthlyData: Array<{
    month: string;
    views: number;
    inquiries: number;
    revenue: number;
  }>;
  topPerformingBillboards: Array<{
    id: string;
    title: string;
    views: number;
    inquiries: number;
  }>;
}

export function BillboardDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchBillboards = async (page = 1, status = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (status !== "all") {
        params.append("status", status);
      }

      const response = await fetch(`/api/billboards/owner?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch billboards");
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      // Mock analytics data for now - in real app this would come from API
      const mockAnalytics: DashboardAnalytics = {
        totalViews: 12450,
        totalInquiries: 342,
        totalRevenue: 45600,
        conversionRate: 2.75,
        monthlyData: [
          { month: "Jan", views: 1800, inquiries: 45, revenue: 6200 },
          { month: "Feb", views: 2100, inquiries: 52, revenue: 7100 },
          { month: "Mar", views: 1950, inquiries: 48, revenue: 6800 },
          { month: "Apr", views: 2300, inquiries: 58, revenue: 8200 },
          { month: "May", views: 2150, inquiries: 55, revenue: 7900 },
          { month: "Jun", views: 2150, inquiries: 84, revenue: 9400 },
        ],
        topPerformingBillboards: [
          {
            id: "1",
            title: "Cape Town CBD Premium",
            views: 2340,
            inquiries: 45,
          },
          {
            id: "2",
            title: "Johannesburg Highway",
            views: 1890,
            inquiries: 38,
          },
          { id: "3", title: "Durban Beachfront", views: 1650, inquiries: 32 },
        ],
      };
      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchBillboards(currentPage, statusFilter);
      fetchAnalytics();
    }
  }, [session, currentPage, statusFilter]);

  const handleRefresh = () => {
    fetchBillboards(currentPage, statusFilter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <BillboardStats billboards={[]} loading={true} />

        {/* Actions Bar Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border rounded"
                >
                  <div className="w-12 h-8 bg-muted rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Link href="/billboards/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="listings">Manage Listings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Metrics */}
          {analytics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Views
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.totalViews.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all billboards
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Inquiries
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.totalInquiries.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.conversionRate.toFixed(2)}% conversion rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(analytics.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From all bookings
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Listings
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.billboards.filter((b) => b.status === "ACTIVE")
                      .length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Out of {data?.billboards.length || 0} total
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stats Overview */}
          {data && <BillboardStats billboards={data.billboards} />}

          {/* Top Performing Billboards */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Top Performing Billboards</span>
                </CardTitle>
                <CardDescription>
                  Your best performing listings this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformingBillboards.map((billboard, index) => (
                    <div
                      key={billboard.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{billboard.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {billboard.views.toLocaleString()} views •{" "}
                            {billboard.inquiries} inquiries
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {(
                            (billboard.inquiries / billboard.views) *
                            100
                          ).toFixed(2)}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          conversion rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Monthly Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Monthly Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Views and inquiries over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      views: {
                        label: "Views",
                        color: "hsl(var(--chart-1))",
                      },
                      inquiries: {
                        label: "Inquiries",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="views" fill="var(--color-views)" />
                      <Bar dataKey="inquiries" fill="var(--color-inquiries)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Revenue Trend</span>
                  </CardTitle>
                  <CardDescription>Monthly revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue (ZAR)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[200px]"
                  >
                    <LineChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Revenue",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-revenue)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          {/* Management Table */}
          {data && (
            <BillboardManagementTable
              billboards={data.billboards}
              pagination={data.pagination}
              onPageChange={handlePageChange}
              onStatusFilterChange={handleStatusFilterChange}
              onRefresh={handleRefresh}
              currentStatusFilter={statusFilter}
            />
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ActivityFeed limit={10} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Recent Activity Summary</span>
                </CardTitle>
                <CardDescription>
                  Quick overview of your recent activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New inquiries this week</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Listings updated</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Messages sent</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile views</span>
                  <Badge variant="secondary">45</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
