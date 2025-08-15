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
  BarChart3,
  LineChart,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
            <div className="mt-2">
              <Progress
                value={Math.min(
                  (data.newUsersThisMonth / data.totalUsers) * 100,
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
            <div className="mt-2">
              <Progress
                value={Math.min(
                  (data.newBillboardsThisMonth / data.totalBillboards) * 100,
                  100
                )}
                className="h-1"
              />
            </div>
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
            <div className="mt-2">
              <Progress
                value={Math.min(
                  (data.messagesThisMonth / data.totalMessages) * 100,
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
            <div className="mt-2">
              <Progress
                value={Math.min(
                  (data.revenueThisMonth / data.totalRevenue) * 100,
                  100
                )}
                className="h-1"
              />
            </div>
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
      <div className="grid gap-4 md:grid-cols-3">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Province Distribution</span>
            </CardTitle>
            <CardDescription>Visual breakdown by province</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={data.topProvinces.reduce((acc, province, index) => {
                acc[province.name] = {
                  label: province.name,
                  color: `hsl(var(--chart-${(index % 5) + 1}))`,
                };
                return acc;
              }, {} as any)}
              className="h-[200px]"
            >
              <PieChart>
                <Pie
                  data={data.topProvinces}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                >
                  {data.topProvinces.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    `${value} (${data.topProvinces.find((p) => p.name === name)?.percentage.toFixed(1)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
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
          <ChartContainer
            config={{
              users: {
                label: "Users",
                color: "hsl(var(--chart-1))",
              },
              billboards: {
                label: "Billboards",
                color: "hsl(var(--chart-2))",
              },
              messages: {
                label: "Messages",
                color: "hsl(var(--chart-3))",
              },
              revenue: {
                label: "Revenue (ZAR)",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[300px]"
          >
            <BarChart data={data.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="users" fill="var(--color-users)" />
              <Bar dataKey="billboards" fill="var(--color-billboards)" />
              <Bar dataKey="messages" fill="var(--color-messages)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="h-4 w-4" />
            <span>Revenue Trend</span>
          </CardTitle>
          <CardDescription>Monthly revenue growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue (ZAR)",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[200px]"
          >
            <RechartsLineChart data={data.monthlyStats}>
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
            </RechartsLineChart>
          </ChartContainer>
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
