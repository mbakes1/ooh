"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Building2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  MapPin,
  Activity,
} from "lucide-react";

interface AnalyticsData {
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
  topProvinces: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topCities: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  monthlyStats: Array<{
    month: string;
    users: number;
    billboards: number;
    messages: number;
    revenue: number;
  }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  onExportReport: (type: string) => void;
}

export function AnalyticsDashboard({
  data,
  onExportReport,
}: AnalyticsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const formatGrowthRate = (rate: number) => {
    const isPositive = rate >= 0;
    return (
      <span className={isPositive ? "text-green-600" : "text-red-600"}>
        {isPositive ? "+" : ""}
        {rate.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatGrowthRate(data.userGrowthRate)} from last month
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
            <div className="text-2xl font-bold">
              {data.totalBillboards.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatGrowthRate(data.billboardGrowthRate)} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalMessages.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatGrowthRate(data.messageGrowthRate)} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatGrowthRate(data.revenueGrowthRate)} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Users This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.newUsersThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Billboards This Month
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.newBillboardsThisMonth}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Messages This Month
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.messagesThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue This Month
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.revenueThisMonth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Top Provinces</span>
            </CardTitle>
            <CardDescription>
              Billboard distribution by province
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topProvinces.map((province, index) => (
              <div
                key={province.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{province.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={province.percentage} className="w-20" />
                  <span className="text-sm text-muted-foreground">
                    {province.count} ({province.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Top Cities</span>
            </CardTitle>
            <CardDescription>Billboard distribution by city</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topCities.map((city, index) => (
              <div
                key={city.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{city.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={city.percentage} className="w-20" />
                  <span className="text-sm text-muted-foreground">
                    {city.count} ({city.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Monthly Trends</span>
          </CardTitle>
          <CardDescription>
            Platform activity over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyStats.map((month) => (
              <div
                key={month.month}
                className="grid grid-cols-5 gap-4 items-center"
              >
                <div className="font-medium">{month.month}</div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Users:</span>{" "}
                  {month.users}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Billboards:</span>{" "}
                  {month.billboards}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Messages:</span>{" "}
                  {month.messages}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Revenue:</span>{" "}
                  {formatCurrency(month.revenue)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>
            Generate detailed reports for analysis and record keeping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onExportReport("users")}>
              Export User Report
            </Button>
            <Button
              variant="outline"
              onClick={() => onExportReport("billboards")}
            >
              Export Billboard Report
            </Button>
            <Button
              variant="outline"
              onClick={() => onExportReport("messages")}
            >
              Export Message Report
            </Button>
            <Button variant="outline" onClick={() => onExportReport("revenue")}>
              Export Revenue Report
            </Button>
            <Button
              variant="outline"
              onClick={() => onExportReport("analytics")}
            >
              Export Full Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
