import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { UserRole } from "@prisma/client";
import { CreateBillboardClient } from "./create-billboard-client";

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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Billboard Listing</h1>
        <p className="text-muted-foreground mt-2">
          List your digital billboard space and connect with advertisers
        </p>
      </div>

      <CreateBillboardClient />
    </div>
  );
}
