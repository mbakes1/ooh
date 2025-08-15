import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export const metadata: Metadata = {
  title: "Admin Dashboard - Digital Billboard Marketplace",
  description:
    "Administrative dashboard for managing users, billboards, and platform analytics.",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Check if user is admin (you may want to add an admin role to your user model)
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Dashboard" },
      ]}
      title="Admin Dashboard"
      description="Administrative dashboard for managing users, billboards, and platform analytics"
    >
      <AdminDashboard />
    </DashboardLayout>
  );
}
