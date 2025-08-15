"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AdminReports } from "@/components/admin/admin-reports";

export default function AdminReportsPage() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const handleGenerateReport = async (config: {
    type: string;
    format: string;
    dateRange: { start: string; end: string };
    filters: Record<string, any>;
  }) => {
    try {
      const response = await fetch(`/api/admin/export/${config.type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: config.format,
          dateRange: config.dateRange,
          filters: config.filters,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${config.type}-report.${config.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  if (status === "loading") {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Reports" },
        ]}
        title="Platform Reports"
        description="View detailed analytics and generate platform reports"
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
        { label: "Reports" },
      ]}
      title="Platform Reports"
      description="View detailed analytics and generate platform reports"
    >
      <AdminReports onGenerateReport={handleGenerateReport} />
    </DashboardLayout>
  );
}
