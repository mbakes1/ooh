"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MessageSquare, TrendingUp, DollarSign } from "lucide-react";

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
}

export function BillboardStats({ billboards }: BillboardStatsProps) {
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

  const statCards = [
    {
      title: "Total Listings",
      value: stats.total,
      icon: BarChart3,
      description: "All your billboard listings",
    },
    {
      title: "Active Listings",
      value: stats.active,
      icon: TrendingUp,
      description: "Currently visible to advertisers",
      color: "text-green-600",
    },
    {
      title: "Total Inquiries",
      value: stats.totalInquiries,
      icon: MessageSquare,
      description: "Messages from potential advertisers",
      color: "text-blue-600",
    },
    {
      title: "Average Price",
      value: `R${stats.averagePrice.toFixed(0)}`,
      icon: DollarSign,
      description: "Average listing price",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon
              className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}

      {/* Status Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Active
              </Badge>
              <span className="text-sm text-muted-foreground">
                {stats.active} listings
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Inactive</Badge>
              <span className="text-sm text-muted-foreground">
                {stats.inactive} listings
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="border-yellow-300 text-yellow-700"
              >
                Pending
              </Badge>
              <span className="text-sm text-muted-foreground">
                {stats.pending} listings
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
