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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Building2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  MapPin,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Download,
} from "lucide-react";

interface AdvancedAnalyticsData {
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
  userEngagement: {
    activeUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    returnUserRate: number;
  };
  billboardPerformance: {
    averageViewsPerBillboard: number;
    topPerformingBillboards: Array<{
      id: string;
      title: string;
      views: number;
      inquiries: number;
    }>;
    conversionRate: number;
  };
  systemHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

interface AdvancedAnalyticsProps {
  data: AdvancedAnalyticsData;
  onExportReport: (type: string) => void;
  onRefreshData: () => void;
}

export function AdvancedAnalytics({
  data,
  onExportReport,
  onRefreshData,
}: AdvancedAnalyticsProps) {
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh and Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive platform insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onRefreshData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button
            variant="outline"
            onClick={() => onExportReport("advanced-analytics")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="performance">Billboard Performance</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
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
                <CardTitle className="text-sm font-medium">
                  Messages Sent
                </CardTitle>
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
                        {province.count} (
                        {formatPercentage(province.percentage)})
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
                <CardDescription>
                  Billboard distribution by city
                </CardDescription>
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
                        {city.count} ({formatPercentage(city.percentage)})
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
                <BarChart3 className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.userEngagement.activeUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Session
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(data.userEngagement.averageSessionDuration / 60)}m
                </div>
                <p className="text-xs text-muted-foreground">
                  Average session duration
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bounce Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(data.userEngagement.bounceRate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Single page visits
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Return Rate
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(data.userEngagement.returnUserRate)}
                </div>
                <p className="text-xs text-muted-foreground">Returning users</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Views</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.billboardPerformance.averageViewsPerBillboard.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Per billboard</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(data.billboardPerformance.conversionRate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Views to inquiries
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.billboardPerformance.topPerformingBillboards
                    .slice(0, 3)
                    .map((billboard, index) => (
                      <div
                        key={billboard.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{billboard.title}</span>
                        <Badge variant="outline">{billboard.views} views</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(data.systemHealth.uptime)}
                </div>
                <p className="text-xs text-muted-foreground">
                  System availability
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Response Time
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.systemHealth.responseTime}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Error Rate
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(data.systemHealth.errorRate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Error percentage
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Connections
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.systemHealth.activeConnections.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current connections
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
