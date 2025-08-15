"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { BillboardManagementTable } from "@/components/billboard/billboard-management-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

export default function BillboardsPage() {
  const { data: session, status } = useSession();
  const [billboards, setBillboards] = useState<BillboardWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchBillboards = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/billboards/owner?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBillboards(data.billboards || []);
      }
    } catch (error) {
      console.error("Failed to fetch billboards:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
    if (status === "authenticated" && session?.user?.role !== UserRole.OWNER) {
      redirect("/");
    }
    if (status === "authenticated") {
      fetchBillboards();
    }
  }, [status, session, fetchBillboards]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Billboards" },
        ]}
        title="My Billboards"
        description="Manage and monitor your billboard listings"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Billboards" },
      ]}
      title="My Billboards"
      description="Manage and monitor your billboard listings"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Billboard Listings</h2>
            <p className="text-muted-foreground">
              View and manage all your billboard listings
            </p>
          </div>
          <Button asChild>
            <Link href="/billboards/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New Billboard
            </Link>
          </Button>
        </div>

        <BillboardManagementTable
          billboards={billboards}
          pagination={{
            page: currentPage,
            limit: 10,
            total: billboards.length,
            pages: Math.ceil(billboards.length / 10),
            hasMore: currentPage < Math.ceil(billboards.length / 10),
          }}
          onPageChange={handlePageChange}
          onStatusFilterChange={handleStatusFilterChange}
          onRefresh={fetchBillboards}
          currentStatusFilter={statusFilter}
        />
      </div>
    </DashboardLayout>
  );
}
