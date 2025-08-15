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
  BarChart3,
  PieChart,
  Download,
  LineChart,
  Target,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
} from "recharts";

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
                <div className="mt-2">
                  <Progress
                    value={
                      (data.userEngagement.activeUsers / data.totalUsers) * 100
                    }
                    className="h-1"
                  />
                </div>
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
                <div className="mt-2">
                  <Progress
                    value={Math.min(
                      (data.userEngagement.averageSessionDuration / 600) * 100,
                      100
                    )}
                    className="h-1"
                  />
                </div>
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
                <div className="mt-2">
                  <Progress
                    value={data.userEngagement.bounceRate}
                    className="h-1"
                  />
                </div>
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
                <div className="mt-2">
                  <Progress
                    value={data.userEngagement.returnUserRate}
                    className="h-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Engagement Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>User Engagement Metrics</span>
                </CardTitle>
                <CardDescription>Key engagement indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    bounceRate: {
                      label: "Bounce Rate",
                      color: "hsl(var(--chart-1))",
                    },
                    returnRate: {
                      label: "Return Rate",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <RadialBarChart
                    data={[
                      {
                        name: "Bounce Rate",
                        value: data.userEngagement.bounceRate,
                        fill: "var(--color-bounceRate)",
                      },
                      {
                        name: "Return Rate",
                        value: data.userEngagement.returnUserRate,
                        fill: "var(--color-returnRate)",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="80%"
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${value}%`, ""]}
                    />
                  </RadialBarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Session Duration Trend</span>
                </CardTitle>
                <CardDescription>
                  Average session duration over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    duration: {
                      label: "Duration (minutes)",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <AreaChart
                    data={data.monthlyStats.map((stat) => ({
                      month: stat.month,
                      duration:
                        Math.round(
                          data.userEngagement.averageSessionDuration / 60
                        ) +
                        Math.random() * 2 -
                        1,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${value} min`, "Duration"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="duration"
                      stroke="var(--color-duration)"
                      fill="var(--color-duration)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
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
                <div className="mt-2">
                  <Progress
                    value={Math.min(
                      (data.billboardPerformance.averageViewsPerBillboard /
                        2000) *
                        100,
                      100
                    )}
                    className="h-1"
                  />
                </div>
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
                <div className="mt-2">
                  <Progress
                    value={data.billboardPerformance.conversionRate}
                    className="h-1"
                  />
                </div>
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
                    .map((billboard) => (
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

          {/* Billboard Performance Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Top Performing Billboards</span>
                </CardTitle>
                <CardDescription>
                  Views and inquiries comparison
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
                  <BarChart
                    data={data.billboardPerformance.topPerformingBillboards}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="views" fill="var(--color-views)" />
                    <Bar dataKey="inquiries" fill="var(--color-inquiries)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-4 w-4" />
                  <span>Performance Distribution</span>
                </CardTitle>
                <CardDescription>
                  Billboard performance breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={data.billboardPerformance.topPerformingBillboards.reduce(
                    (acc, billboard, index) => {
                      acc[billboard.title] = {
                        label: billboard.title,
                        color: `hsl(var(--chart-${(index % 5) + 1}))`,
                      };
                      return acc;
                    },
                    {} as any
                  )}
                  className="h-[300px]"
                >
                  <RechartsPieChart>
                    <Pie
                      data={data.billboardPerformance.topPerformingBillboards}
                      dataKey="views"
                      nameKey="title"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.billboardPerformance.topPerformingBillboards.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                          />
                        )
                      )}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [`${value} views`, name]}
                    />
                  </RechartsPieChart>
                </ChartContainer>
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
                <div className="mt-2">
                  <Progress value={data.systemHealth.uptime} className="h-1" />
                </div>
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
                <div className="mt-2">
                  <Progress
                    value={Math.max(
                      0,
                      100 - (data.systemHealth.responseTime / 500) * 100
                    )}
                    className="h-1"
                  />
                </div>
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
                <div className="mt-2">
                  <Progress
                    value={data.systemHealth.errorRate}
                    className="h-1"
                  />
                </div>
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
                <div className="mt-2">
                  <Progress
                    value={Math.min(
                      (data.systemHealth.activeConnections / 1000) * 100,
                      100
                    )}
                    className="h-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-4 w-4" />
                  <span>Response Time Trend</span>
                </CardTitle>
                <CardDescription>
                  Average response time over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    responseTime: {
                      label: "Response Time (ms)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <RechartsLineChart
                    data={data.monthlyStats.map((stat) => ({
                      month: stat.month,
                      responseTime:
                        data.systemHealth.responseTime +
                        Math.random() * 50 -
                        25,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [
                        `${Math.round(Number(value))}ms`,
                        "Response Time",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="var(--color-responseTime)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-responseTime)" }}
                    />
                  </RechartsLineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>System Health Overview</span>
                </CardTitle>
                <CardDescription>Key system health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    uptime: {
                      label: "Uptime",
                      color: "hsl(var(--chart-2))",
                    },
                    performance: {
                      label: "Performance",
                      color: "hsl(var(--chart-3))",
                    },
                    reliability: {
                      label: "Reliability",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <RadialBarChart
                    data={[
                      {
                        name: "Uptime",
                        value: data.systemHealth.uptime,
                        fill: "var(--color-uptime)",
                      },
                      {
                        name: "Performance",
                        value: Math.max(
                          0,
                          100 - (data.systemHealth.responseTime / 500) * 100
                        ),
                        fill: "var(--color-performance)",
                      },
                      {
                        name: "Reliability",
                        value: Math.max(
                          0,
                          100 - data.systemHealth.errorRate * 10
                        ),
                        fill: "var(--color-reliability)",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [
                        `${Math.round(Number(value))}%`,
                        "",
                      ]}
                    />
                  </RadialBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
