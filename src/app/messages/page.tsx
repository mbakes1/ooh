import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { MessageCenterRefined } from "@/components/messaging";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export const metadata: Metadata = {
  title: "Messages | Digital Billboard Marketplace",
  description:
    "Manage your conversations with billboard owners and advertisers",
};

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/messages");
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Messages" }]}>
      <MessageCenterRefined />
    </DashboardLayout>
  );
}
