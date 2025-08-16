import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { UserRole } from "@prisma/client";
import { CreateBillboardClient } from "./create-billboard-client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default async function CreateBillboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/billboards/create");
  }

  // Check if user is a billboard owner
  if (session.user.role !== UserRole.OWNER) {
    redirect("/profile?error=owner-required");
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Billboards", href: "/dashboard/billboards" },
        { label: "Create New" },
      ]}
    >
      <CreateBillboardClient />
    </DashboardLayout>
  );
}
