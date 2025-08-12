import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { UserRole } from "@prisma/client";
import { BillboardDashboard } from "@/components/billboard/billboard-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Only billboard owners can access the dashboard
  if (session.user.role !== UserRole.OWNER) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billboard Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your billboard listings and track performance
        </p>
      </div>

      <BillboardDashboard />
    </div>
  );
}
