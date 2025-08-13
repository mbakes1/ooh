import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { UserRole, BillboardStatus } from "@prisma/client";
import { z } from "zod";
import { NotificationService } from "@/lib/notifications/service";
import { emitBillboardStatusUpdate } from "@/lib/websocket/server";

const statusUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a billboard owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: "Only billboard owners can update listing status" },
        { status: 403 }
      );
    }

    // Check if billboard exists and belongs to the user
    const existingBillboard = await prisma.billboard.findUnique({
      where: { id },
      select: { ownerId: true, status: true, title: true },
    });

    if (!existingBillboard) {
      return NextResponse.json(
        { error: "Billboard not found" },
        { status: 404 }
      );
    }

    if (existingBillboard.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own billboards" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = statusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    const oldStatus = existingBillboard.status;

    // Update the billboard status
    const billboard = await prisma.billboard.update({
      where: { id },
      data: { status: status as BillboardStatus },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            businessName: true,
            verified: true,
          },
        },
      },
    });

    // Send real-time notification
    try {
      emitBillboardStatusUpdate({
        billboardId: id,
        ownerId: session.user.id,
        status: status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to send real-time status update:", error);
    }

    // Create in-app notification
    try {
      await NotificationService.createStatusChangeNotification({
        ownerId: session.user.id,
        billboardTitle: existingBillboard.title,
        billboardId: id,
        oldStatus: oldStatus,
        newStatus: status,
      });
    } catch (error) {
      console.error("Failed to create status change notification:", error);
    }

    return NextResponse.json({
      message: "Billboard status updated successfully",
      billboard,
    });
  } catch (error) {
    console.error("Error updating billboard status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
