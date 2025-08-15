"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BillboardManagementTable } from "./billboard-management-table";
import { BillboardStats } from "./billboard-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, RefreshCw, Eye, MessageSquare, Building2 } from "lucide-react";
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

export function BillboardDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (session?.user) {
      fetchBillboards(currentPage, statusFilter);
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Manage Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Simple Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Listings
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.billboards.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All your billboard listings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Listings
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.billboards.filter((b) => b.status === "ACTIVE")
                    .length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently visible to advertisers
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
                <div className="text-2xl font-bold">
                  {data?.billboards.filter((b) => b.status === "PENDING")
                    .length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting admin review
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
                  {data?.billboards.reduce(
                    (sum, b) => sum + (b.analytics?.totalInquiries || 0),
                    0
                  ) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Messages received
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          {data && <BillboardStats billboards={data.billboards} />}
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
      </Tabs>
    </div>
  );
}
