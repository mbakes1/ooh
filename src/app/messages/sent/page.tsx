import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export const metadata: Metadata = {
  title: "Sent Messages - Digital Billboard Marketplace",
  description: "View your sent messages",
};

export default async function SentMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Messages", href: "/messages" },
        { label: "Sent" },
      ]}
      title="Sent Messages"
      description="View messages you have sent"
    >
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Sent Messages</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">
                  Billboard Inquiry - Location ABC
                </h4>
                <span className="text-sm text-muted-foreground">
                  2 hours ago
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                To: John Smith
              </p>
              <p className="text-sm">
                Hi, I&apos;m interested in your billboard location...
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Follow-up on Billboard Rental</h4>
                <span className="text-sm text-muted-foreground">1 day ago</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                To: Sarah Johnson
              </p>
              <p className="text-sm">
                Thank you for your response. I&apos;d like to discuss...
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
