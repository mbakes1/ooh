import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { UserRole } from "@prisma/client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export const metadata: Metadata = {
  title: "Analytics - Digital Billboard Marketplace",
  description: "View detailed analytics for your billboard listings",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== UserRole.OWNER) {
    redirect("/");
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Analytics" },
      ]}
      title="Analytics"
      description="View detailed performance metrics for your billboard listings"
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Views
            </h3>
            <p className="text-2xl font-bold">12,450</p>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Inquiries
            </h3>
            <p className="text-2xl font-bold">342</p>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Active Listings
            </h3>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">2 pending approval</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Revenue
            </h3>
            <p className="text-2xl font-bold">R45,230</p>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <div className="h-64 bg-muted rounded flex items-center justify-center">
            <p className="text-muted-foreground">
              Analytics charts will be displayed here
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
