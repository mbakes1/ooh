import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { UserRole, BillboardStatus } from "@prisma/client";
import { z } from "zod";

const bulkActionSchema = z.object({
  action: z.enum(["activate", "deactivate", "delete"]),
  billboardIds: z
    .array(z.string())
    .min(1, "At least one billboard ID is required"),
});

export async function POST(request: NextRequest) {
  try {
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
        { error: "Only billboard owners can perform bulk actions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = bulkActionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { action, billboardIds } = validationResult.data;

    // Verify all billboards belong to the user
    const billboards = await prisma.billboard.findMany({
      where: {
        id: { in: billboardIds },
        ownerId: session.user.id,
      },
      select: { id: true },
    });

    if (billboards.length !== billboardIds.length) {
      return NextResponse.json(
        { error: "Some billboards not found or don't belong to you" },
        { status: 403 }
      );
    }

    let result;
    let message;

    switch (action) {
      case "activate":
        result = await prisma.billboard.updateMany({
          where: {
            id: { in: billboardIds },
            ownerId: session.user.id,
          },
          data: { status: BillboardStatus.ACTIVE },
        });
        message = `${result.count} billboards activated successfully`;
        break;

      case "deactivate":
        result = await prisma.billboard.updateMany({
          where: {
            id: { in: billboardIds },
            ownerId: session.user.id,
          },
          data: { status: BillboardStatus.INACTIVE },
        });
        message = `${result.count} billboards deactivated successfully`;
        break;

      case "delete":
        result = await prisma.billboard.deleteMany({
          where: {
            id: { in: billboardIds },
            ownerId: session.user.id,
          },
        });
        message = `${result.count} billboards deleted successfully`;
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      message,
      affectedCount: result.count,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
