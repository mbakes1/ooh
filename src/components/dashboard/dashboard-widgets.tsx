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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Base widget interface
interface BaseWidgetProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  onRefresh?: () => void;
  customActions?: React.ReactNode;
}

// Metric widget for displaying key performance indicators
interface MetricWidgetProps extends BaseWidgetProps {
  value: string | number;
  previousValue?: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  format?: "number" | "currency" | "percentage";
  showProgress?: boolean;
  progressValue?: number;
  progressMax?: number;
}

export function MetricWidget({
  title,
  description,
  value,
  trend,
  trendValue,
  icon,
  format = "number",
  loading = false,
  error,
  className,
  onRefresh,
  customActions,
  showProgress = false,
  progressValue,
  progressMax = 100,
}: MetricWidgetProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;

    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-ZA", {
          style: "currency",
          currency: "ZAR",
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
          {showProgress && <Skeleton className="h-1 w-full mt-2" />}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-1">
          {icon}
          {(onRefresh || customActions) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onRefresh && (
                  <DropdownMenuItem onClick={onRefresh}>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Refresh
                  </DropdownMenuItem>
                )}
                {customActions}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {(description || trendValue) && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            {trendValue && (
              <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
        {showProgress && progressValue !== undefined && (
          <div className="mt-2">
            <Progress
              value={(progressValue / progressMax) * 100}
              className="h-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// List widget for displaying ranked or categorized data
interface ListWidgetProps extends BaseWidgetProps {
  items: Array<{
    id: string;
    label: string;
    value: string | number;
    subValue?: string;
    badge?: string;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
    progress?: number;
  }>;
  showRanking?: boolean;
  maxItems?: number;
}

export function ListWidget({
  title,
  description,
  items,
  showRanking = false,
  maxItems = 5,
  loading = false,
  error,
  className,
  onRefresh,
  customActions,
}: ListWidgetProps) {
  const displayItems = items.slice(0, maxItems);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {(onRefresh || customActions) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
              )}
              {customActions}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {showRanking && (
                    <Badge variant="outline" className="flex-shrink-0">
                      {index + 1}
                    </Badge>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    {item.subValue && (
                      <p className="text-sm text-muted-foreground">
                        {item.subValue}
                      </p>
                    )}
                    {item.progress !== undefined && (
                      <Progress value={item.progress} className="h-1 mt-1" />
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="font-medium">{item.value}</span>
                  {item.badge && (
                    <Badge variant={item.badgeVariant || "secondary"}>
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Status widget for displaying system status or health indicators
interface StatusWidgetProps extends BaseWidgetProps {
  status: "healthy" | "warning" | "critical" | "unknown";
  statusText?: string;
  details?: Array<{
    label: string;
    value: string;
    status?: "healthy" | "warning" | "critical";
  }>;
}

export function StatusWidget({
  title,
  description,
  status,
  statusText,
  details = [],
  loading = false,
  error,
  className,
  onRefresh,
  customActions,
}: StatusWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "default" as const;
      case "warning":
        return "secondary" as const;
      case "critical":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-4" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {(onRefresh || customActions) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
              )}
              {customActions}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <>
            <div className="mb-4">
              <Badge
                variant={getStatusBadgeVariant(status)}
                className={`${getStatusColor(status)} text-sm px-3 py-1`}
              >
                {statusText || status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            {details.length > 0 && (
              <div className="space-y-2">
                {details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {detail.label}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{detail.value}</span>
                      {detail.status && (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            detail.status === "healthy"
                              ? "bg-green-500"
                              : detail.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Chart widget wrapper for embedding charts in dashboard
interface ChartWidgetProps extends BaseWidgetProps {
  children: React.ReactNode;
  height?: string;
}

export function ChartWidget({
  title,
  description,
  children,
  height = "300px",
  loading = false,
  error,
  className,
  onRefresh,
  customActions,
}: ChartWidgetProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className={`w-full`} style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {(onRefresh || customActions) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
              )}
              {customActions}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
