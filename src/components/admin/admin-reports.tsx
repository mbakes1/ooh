"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Building2,
  MessageSquare,
  DollarSign,
  Filter,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface ReportConfig {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  formats: string[];
  filters: string[];
}

interface AdminReportsProps {
  onGenerateReport: (config: {
    type: string;
    format: string;
    dateRange: { start: string; end: string };
    filters: Record<string, any>;
  }) => Promise<void>;
}

export function AdminReports({ onGenerateReport }: AdminReportsProps) {
  const [selectedReport, setSelectedReport] = React.useState<string>("");
  const [selectedFormat, setSelectedFormat] = React.useState<string>("csv");
  const [dateRange, setDateRange] = React.useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = React.useState(false);

  const reportConfigs: ReportConfig[] = [
    {
      type: "users",
      name: "User Report",
      description:
        "Comprehensive user data including registration, activity, and demographics",
      icon: Users,
      formats: ["csv", "xlsx", "pdf"],
      filters: ["role", "verified", "suspended", "location"],
    },
    {
      type: "billboards",
      name: "Billboard Report",
      description:
        "Billboard listings, performance metrics, and owner information",
      icon: Building2,
      formats: ["csv", "xlsx", "pdf"],
      filters: ["status", "province", "city", "price_range", "traffic_level"],
    },
    {
      type: "messages",
      name: "Messaging Report",
      description:
        "Communication patterns, message volume, and user engagement",
      icon: MessageSquare,
      formats: ["csv", "xlsx"],
      filters: ["date_range", "user_type", "conversation_status"],
    },
    {
      type: "revenue",
      name: "Revenue Report",
      description: "Financial metrics, transaction data, and revenue trends",
      icon: DollarSign,
      formats: ["csv", "xlsx", "pdf"],
      filters: ["date_range", "payment_method", "transaction_status"],
    },
    {
      type: "analytics",
      name: "Analytics Report",
      description:
        "Platform usage statistics, performance metrics, and growth analysis",
      icon: BarChart3,
      formats: ["csv", "xlsx", "pdf"],
      filters: ["metric_type", "date_range", "granularity"],
    },
    {
      type: "moderation",
      name: "Moderation Report",
      description:
        "Content moderation activities, approval rates, and policy violations",
      icon: FileText,
      formats: ["csv", "xlsx", "pdf"],
      filters: ["action_type", "moderator", "content_type"],
    },
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error("Please select a report type");
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerateReport({
        type: selectedReport,
        format: selectedFormat,
        dateRange,
        filters,
      });
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedConfig = reportConfigs.find(
    (config) => config.type === selectedReport
  );

  const renderFilterInputs = () => {
    if (!selectedConfig) return null;

    return selectedConfig.filters.map((filter) => {
      switch (filter) {
        case "role":
          return (
            <div key={filter} className="space-y-2">
              <Label htmlFor="role-filter">User Role</Label>
              <Select
                value={filters.role || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All roles</SelectItem>
                  <SelectItem value="OWNER">Billboard Owners</SelectItem>
                  <SelectItem value="ADVERTISER">Advertisers</SelectItem>
                  <SelectItem value="ADMIN">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );

        case "status":
          return (
            <div key={filter} className="space-y-2">
              <Label htmlFor="status-filter">Billboard Status</Label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );

        case "province":
          return (
            <div key={filter} className="space-y-2">
              <Label htmlFor="province-filter">Province</Label>
              <Select
                value={filters.province || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, province: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All provinces</SelectItem>
                  <SelectItem value="Gauteng">Gauteng</SelectItem>
                  <SelectItem value="Western Cape">Western Cape</SelectItem>
                  <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                  <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                  <SelectItem value="Free State">Free State</SelectItem>
                  <SelectItem value="Limpopo">Limpopo</SelectItem>
                  <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                  <SelectItem value="North West">North West</SelectItem>
                  <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );

        case "verified":
          return (
            <div key={filter} className="space-y-2">
              <Label htmlFor="verified-filter">Verification Status</Label>
              <Select
                value={filters.verified || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, verified: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All users</SelectItem>
                  <SelectItem value="true">Verified only</SelectItem>
                  <SelectItem value="false">Unverified only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );

        case "traffic_level":
          return (
            <div key={filter} className="space-y-2">
              <Label htmlFor="traffic-filter">Traffic Level</Label>
              <Select
                value={filters.traffic_level || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, traffic_level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All traffic levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All traffic levels</SelectItem>
                  <SelectItem value="HIGH">High Traffic</SelectItem>
                  <SelectItem value="MEDIUM">Medium Traffic</SelectItem>
                  <SelectItem value="LOW">Low Traffic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );

        case "price_range":
          return (
            <div key={filter} className="space-y-2">
              <Label htmlFor="price-filter">Price Range (ZAR)</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={filters.min_price || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      min_price: e.target.value,
                    }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.max_price || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      max_price: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Reports</h2>
          <p className="text-muted-foreground">
            Generate comprehensive reports for analysis and compliance
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Report Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Report Configuration</span>
            </CardTitle>
            <CardDescription>
              Select report type and configure parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportConfigs.map((config) => (
                    <SelectItem key={config.type} value={config.type}>
                      <div className="flex items-center space-x-2">
                        <config.icon className="h-4 w-4" />
                        <span>{config.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedConfig && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {selectedConfig.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedConfig.formats.map((format) => (
                    <Badge key={format} variant="outline" className="text-xs">
                      {format.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedConfig?.formats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format.toUpperCase()}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </CardTitle>
            <CardDescription>
              Apply filters to customize your report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedConfig ? (
              renderFilterInputs()
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a report type to see available filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Reports Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Choose from the following report types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportConfigs.map((config) => (
              <Card
                key={config.type}
                className={`cursor-pointer transition-colors ${
                  selectedReport === config.type
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedReport(config.type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <config.icon className="h-5 w-5 mt-0.5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{config.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {config.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {config.formats.map((format) => (
                          <Badge
                            key={format}
                            variant="outline"
                            className="text-xs"
                          >
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleGenerateReport}
          disabled={!selectedReport || isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
