import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { BillboardEditForm } from "@/components/billboard/billboard-edit-form";

interface EditBillboardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBillboardPage({
  params,
}: EditBillboardPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Only billboard owners can edit listings
  if (session.user.role !== UserRole.OWNER) {
    redirect("/");
  }

  // Fetch the billboard and verify ownership
  const billboard = await prisma.billboard.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
    },
  });

  if (!billboard) {
    notFound();
  }

  // Verify the billboard belongs to the current user
  if (billboard.ownerId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Billboard Listing</h1>
        <p className="text-muted-foreground mt-2">
          Update your billboard information and settings
        </p>
      </div>

      <BillboardEditForm
        billboard={{
          ...billboard,
          basePrice: Number(billboard.basePrice),
        }}
      />
    </div>
  );
}
