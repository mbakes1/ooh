"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, MessageSquare, TrendingUp, DollarSign } from "lucide-react";
import {
  MetricWidget,
  StatusWidget,
} from "@/components/dashboard/dashboard-widgets";

interface BillboardWithAnalytics {
  id: string;
  title: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  basePrice: number;
  analytics: {
    totalInquiries: number;
  };
}

interface BillboardStatsProps {
  billboards: BillboardWithAnalytics[];
  loading?: boolean;
}

export function BillboardStats({
  billboards,
  loading = false,
}: BillboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}

        {/* Status Breakdown Skeleton */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const stats = {
    total: billboards.length,
    active: billboards.filter((b) => b.status === "ACTIVE").length,
    inactive: billboards.filter((b) => b.status === "INACTIVE").length,
    pending: billboards.filter((b) => b.status === "PENDING").length,
    totalInquiries: billboards.reduce(
      (sum, b) => sum + b.analytics.totalInquiries,
      0
    ),
    averagePrice:
      billboards.length > 0
        ? billboards.reduce((sum, b) => sum + Number(b.basePrice), 0) /
          billboards.length
        : 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricWidget
        title="Total Listings"
        value={stats.total}
        description="All your billboard listings"
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        showProgress={true}
        progressValue={stats.active}
        progressMax={stats.total}
      />

      <MetricWidget
        title="Active Listings"
        value={stats.active}
        description="Currently visible to advertisers"
        icon={<TrendingUp className="h-4 w-4 text-green-600" />}
        trend={
          stats.active > stats.inactive
            ? "up"
            : stats.active < stats.inactive
              ? "down"
              : "neutral"
        }
        trendValue={`${((stats.active / stats.total) * 100).toFixed(0)}% active`}
        showProgress={true}
        progressValue={stats.active}
        progressMax={stats.total}
      />

      <MetricWidget
        title="Total Inquiries"
        value={stats.totalInquiries}
        description="Messages from potential advertisers"
        icon={<MessageSquare className="h-4 w-4 text-blue-600" />}
        trend={stats.totalInquiries > 0 ? "up" : "neutral"}
        trendValue={
          stats.totalInquiries > 0 ? "Active interest" : "No inquiries yet"
        }
      />

      <MetricWidget
        title="Average Price"
        value={stats.averagePrice}
        description="Average listing price"
        format="currency"
        icon={<DollarSign className="h-4 w-4 text-purple-600" />}
      />

      {/* Status Breakdown Widget */}
      <StatusWidget
        title="Listing Status Overview"
        description="Current status of all your listings"
        status={
          stats.active > stats.inactive
            ? "healthy"
            : stats.pending > 0
              ? "warning"
              : "critical"
        }
        statusText={`${stats.active} Active, ${stats.pending} Pending, ${stats.inactive} Inactive`}
        details={[
          {
            label: "Active Listings",
            value: `${stats.active}`,
            status: "healthy",
          },
          {
            label: "Pending Approval",
            value: `${stats.pending}`,
            status: stats.pending > 0 ? "warning" : "healthy",
          },
          {
            label: "Inactive Listings",
            value: `${stats.inactive}`,
            status: stats.inactive > stats.active ? "warning" : "healthy",
          },
        ]}
        className="md:col-span-2 lg:col-span-4"
      />
    </div>
  );
}
