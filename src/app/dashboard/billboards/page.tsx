"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { BillboardManagementTable } from "@/components/billboard/billboard-management-table";
import { useOwnerBillboards } from "@/hooks/use-owner-billboards";

export default function BillboardsPage() {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // TanStack Query hook
  const {
    data: billboards = [],
    isLoading,
    error,
    refetch,
  } = useOwnerBillboards({
    page: currentPage,
    limit: 10,
    status: statusFilter,
  });

  // Authentication checks
  if (status === "unauthenticated") {
    redirect("/auth/login");
  }
  if (status === "authenticated" && session?.user?.role !== UserRole.OWNER) {
    redirect("/");
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Billboards" },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Billboards" },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load billboards</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
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
    >
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
        onRefresh={handleRefresh}
        currentStatusFilter={statusFilter}
      />
    </DashboardLayout>
  );
}
