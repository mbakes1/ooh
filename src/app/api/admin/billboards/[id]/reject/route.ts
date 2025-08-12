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
    const { reason } = await request.json();

    // Update billboard status to REJECTED
    const updatedBillboard = await prisma.billboard.update({
      where: { id: billboardId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectedBy: session.user.id,
        rejectionReason: reason,
      },
    });

    return NextResponse.json(updatedBillboard);
  } catch (error) {
    console.error("Error rejecting billboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
