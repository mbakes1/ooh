import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { BillboardDetailView } from "@/components/billboard/billboard-detail-view";

interface BillboardDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BillboardDetailPage({
  params,
}: BillboardDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // Fetch the billboard with all related data
  const billboard = await prisma.billboard.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      owner: {
        select: {
          id: true,
          name: true,
          businessName: true,
          contactNumber: true,
          verified: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          conversations: true,
        },
      },
    },
  });

  if (!billboard) {
    notFound();
  }

  // Check if the current user is the owner
  const isOwner = session?.user?.id === billboard.ownerId;

  return (
    <div className="container mx-auto py-8">
      <BillboardDetailView
        billboard={{
          ...billboard,
          basePrice: Number(billboard.basePrice),
        }}
        isOwner={isOwner}
        currentUser={session?.user || null}
      />
    </div>
  );
}
