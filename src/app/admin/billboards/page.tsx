"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { BillboardModeration } from "@/components/admin/billboard-moderation";
import {
  useAdminBillboards,
  useApproveBillboard,
  useRejectBillboard,
  useSuspendBillboard,
} from "@/hooks/use-admin-billboards";

export default function AdminBillboardsPage() {
  const { data: session, status } = useSession();

  // TanStack Query hooks
  const { data: billboards = [], isLoading, error } = useAdminBillboards();
  const approveMutation = useApproveBillboard();
  const rejectMutation = useRejectBillboard();
  const suspendMutation = useSuspendBillboard();

  // Authentication checks
  if (status === "unauthenticated") {
    redirect("/auth/login");
  }
  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const handleApproveBillboard = (billboardId: string) => {
    approveMutation.mutate(billboardId);
  };

  const handleRejectBillboard = (billboardId: string, reason: string) => {
    rejectMutation.mutate({ billboardId, reason });
  };

  const handleViewBillboard = (billboardId: string) => {
    window.open(`/billboards/${billboardId}`, "_blank");
  };

  const handleSuspendBillboard = (billboardId: string) => {
    suspendMutation.mutate(billboardId);
  };

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Billboards" },
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
          { label: "Administration", href: "/admin" },
          { label: "Billboards" },
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load billboards</p>
            <button
              onClick={() => window.location.reload()}
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
        { label: "Administration", href: "/admin" },
        { label: "Billboards" },
      ]}
    >
      <BillboardModeration
        billboards={billboards}
        onApproveBillboard={handleApproveBillboard}
        onRejectBillboard={handleRejectBillboard}
        onViewBillboard={handleViewBillboard}
        onSuspendBillboard={handleSuspendBillboard}
      />
    </DashboardLayout>
  );
}
