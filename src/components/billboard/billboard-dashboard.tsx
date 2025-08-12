"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BillboardManagementTable } from "./billboard-management-table";
import { BillboardStats } from "./billboard-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin" />
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
      {/* Stats Overview */}
      {data && <BillboardStats billboards={data.billboards} />}

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Your Listings</h2>
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
    </div>
  );
}
