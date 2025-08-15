"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { BillboardModeration } from "@/components/admin/billboard-moderation";
import { Billboard } from "@prisma/client";

export default function AdminBillboardsPage() {
  const { data: session, status } = useSession();
  const [billboards, setBillboards] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      redirect("/dashboard");
    }
    if (status === "authenticated") {
      fetchBillboards();
    }
  }, [status, session]);

  const fetchBillboards = async () => {
    try {
      const response = await fetch("/api/admin/billboards");
      if (response.ok) {
        const data = await response.json();
        setBillboards(data.billboards || []);
      }
    } catch (error) {
      console.error("Failed to fetch billboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBillboard = async (billboardId: string) => {
    try {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/approve`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        fetchBillboards();
      }
    } catch (error) {
      console.error("Failed to approve billboard:", error);
    }
  };

  const handleRejectBillboard = async (billboardId: string, reason: string) => {
    try {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );
      if (response.ok) {
        fetchBillboards();
      }
    } catch (error) {
      console.error("Failed to reject billboard:", error);
    }
  };

  const handleViewBillboard = (billboardId: string) => {
    window.open(`/billboards/${billboardId}`, "_blank");
  };

  const handleSuspendBillboard = async (billboardId: string) => {
    try {
      const response = await fetch(
        `/api/admin/billboards/${billboardId}/suspend`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        fetchBillboards();
      }
    } catch (error) {
      console.error("Failed to suspend billboard:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Billboards" },
        ]}
        title="Billboard Management"
        description="Moderate billboard listings and manage platform content"
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
        { label: "Administration", href: "/admin" },
        { label: "Billboards" },
      ]}
      title="Billboard Management"
      description="Moderate billboard listings and manage platform content"
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
