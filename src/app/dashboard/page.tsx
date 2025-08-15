import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { UserRole } from "@prisma/client";
import { BillboardDashboard } from "@/components/billboard/billboard-dashboard";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export const metadata: Metadata = {
  title: "Dashboard - Digital Billboard Marketplace",
  description: "Manage your billboard listings and track performance",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Only billboard owners can access the dashboard
  if (session.user.role !== UserRole.OWNER) {
    redirect("/");
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Overview" },
      ]}
      title="Billboard Dashboard"
      description="Manage your billboard listings and track performance"
    >
      <BillboardDashboard />
    </DashboardLayout>
  );
}
