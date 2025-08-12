import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: billboardId } = await params;

    // Update billboard status to ACTIVE
    const updatedBillboard = await prisma.billboard.update({
      where: { id: billboardId },
      data: {
        status: "ACTIVE",
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
    });

    return NextResponse.json(updatedBillboard);
  } catch (error) {
    console.error("Error approving billboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
